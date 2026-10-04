from pathlib import Path
import re

from django.conf import settings
from django.contrib.auth import authenticate
from django.db.models import Q
from django.http import Http404
from django.utils import timezone
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.exceptions import APIException
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework.views import exception_handler as drf_exception_handler
from rest_framework_simplejwt.exceptions import InvalidToken, TokenError
from rest_framework_simplejwt.serializers import TokenRefreshSerializer
from rest_framework_simplejwt.tokens import RefreshToken

from .models import Activity, Bookmark, ChatMessage, ChatSession, Chunk, Collection, Document, SearchHistory, Tag, User
from .services import chunk_text, clean_text, score_chunk, summarize_with_llm, synthesize_answer


def exception_handler(exc, context):
    response = drf_exception_handler(exc, context)
    if response is None:
        if isinstance(exc, Http404):
            return Response({"detail": "Not found."}, status=404)
        return Response({"detail": "Something went wrong on our side. Please try again."}, status=500)
    if isinstance(response.data, dict):
        if "detail" not in response.data:
            first = next(iter(response.data.values()), "Invalid request.")
            if isinstance(first, list): first = first[0] if first else "Invalid request."
            response.data["detail"] = str(first)
    else:
        response.data = {"detail": str(response.data[0] if response.data else "Invalid request.")}
    return response


def iso(value):
    return value.isoformat().replace("+00:00", "Z") if value else None


def record(user, kind, label, detail):
    Activity.objects.create(owner=user, kind=kind, label=label[:255], detail=detail[:255])
    stale = Activity.objects.filter(owner=user).order_by("-created_at")[100:]
    Activity.objects.filter(id__in=stale.values("id")).delete()


def user_data(user):
    return {"id": str(user.id), "name": user.name, "email": user.email, "joinedAt": iso(user.date_joined)}


def collection_data(collection):
    return {"id": str(collection.id), "name": collection.name, "description": collection.description,
            "documentCount": collection.documents.count(), "accent": collection.accent, "updatedAt": iso(collection.updated_at)}


def document_data(document, user, detail=False):
    bookmarked = Bookmark.objects.filter(owner=user, document=document).exists()
    data = {
        "id": str(document.id), "name": document.name, "type": document.type, "size": document.size,
        "pages": document.pages, "collectionId": str(document.collection_id) if document.collection_id else None,
        "collectionName": document.collection.name if document.collection else None,
        "tags": sorted(document.tags.values_list("name", flat=True), key=str.lower), "status": document.status,
        "progress": document.progress, "error": document.error if document.status == "failed" else None,
        "excerpt": document.excerpt, "createdAt": iso(document.created_at), "updatedAt": iso(document.updated_at),
        "openedAt": iso(document.opened_at), "lastPage": document.last_page, "bookmarked": bookmarked,
    }
    if detail: data["pageText"] = document.page_text
    return data


def source_data(document, page, text):
    return {"documentId": str(document.id), "documentName": document.name, "documentType": document.type,
            "page": page, "excerpt": text[:400]}


def bookmark_data(bookmark):
    doc = bookmark.document
    return {"id": str(bookmark.id), "documentId": str(doc.id), "documentName": doc.name, "documentType": doc.type,
            "page": bookmark.page, "excerpt": bookmark.excerpt, "note": bookmark.note, "savedAt": iso(bookmark.created_at)}


def owned_or_404(model, user, pk, message="Not found."):
    try: return model.objects.get(pk=pk, owner=user)
    except model.DoesNotExist: raise APIException(detail=message, code=404)


def not_found(message):
    error = APIException(message); error.status_code = 404; raise error


@api_view(["GET"])
@permission_classes([AllowAny])
def health(request):
    return Response({"status": "ok"})


@api_view(["POST"])
@permission_classes([AllowAny])
def register(request):
    name, email, password = (request.data.get("name") or "").strip(), (request.data.get("email") or "").strip().lower(), request.data.get("password") or ""
    if not name: return Response({"detail": "Enter your name."}, status=400)
    if not email or "@" not in email: return Response({"detail": "Enter a valid email address."}, status=400)
    if len(password) < 8: return Response({"detail": "Password must contain at least 8 characters."}, status=400)
    if User.objects.filter(email__iexact=email).exists(): return Response({"detail": "An account already uses this email."}, status=409)
    user = User.objects.create_user(email=email, password=password, name=name)
    token = RefreshToken.for_user(user)
    return Response({"user": user_data(user), "access": str(token.access_token), "refresh": str(token)}, status=201)


@api_view(["POST"])
@permission_classes([AllowAny])
def login(request):
    email, password = (request.data.get("email") or "").strip().lower(), request.data.get("password") or ""
    if not email or not password: return Response({"detail": "Enter your email and password."}, status=400)
    user = authenticate(request, email=email, password=password)
    if not user or not user.is_active: return Response({"detail": "Those credentials do not match an account."}, status=401)
    token = RefreshToken.for_user(user)
    return Response({"user": user_data(user), "access": str(token.access_token), "refresh": str(token)})


@api_view(["POST"])
@permission_classes([AllowAny])
def refresh(request):
    try:
        serializer = TokenRefreshSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        return Response(serializer.validated_data)
    except (InvalidToken, TokenError):
        return Response({"detail": "Token is invalid or expired."}, status=401)


@api_view(["GET"])
def me(request): return Response(user_data(request.user))


@api_view(["POST"])
def logout(request):
    try: RefreshToken(request.data.get("refresh")).blacklist()
    except (TokenError, TypeError): return Response({"detail": "Token is invalid or expired."}, status=401)
    return Response(status=204)


@api_view(["GET", "POST"])
def collections(request):
    if request.method == "GET":
        items = Collection.objects.filter(owner=request.user).order_by("-updated_at")
        return Response({"results": [collection_data(item) for item in items], "count": items.count()})
    name = (request.data.get("name") or "").strip()
    if not name: return Response({"detail": "Give the collection a name."}, status=400)
    if Collection.objects.filter(owner=request.user, name__iexact=name).exists(): return Response({"detail": "A collection with that name already exists."}, status=409)
    colors = ["#4F6DF5", "#177245", "#9A6700", "#7C3AED", "#B42318"]
    item = Collection.objects.create(owner=request.user, name=name, description=(request.data.get("description") or "").strip(), accent=colors[Collection.objects.filter(owner=request.user).count() % len(colors)])
    record(request.user, "collection", item.name, "Collection created")
    return Response(collection_data(item), status=201)


@api_view(["GET", "PATCH", "DELETE"])
def collection_detail(request, pk):
    try: item = Collection.objects.get(pk=pk, owner=request.user)
    except Collection.DoesNotExist: return Response({"detail": "That collection no longer exists."}, status=404)
    if request.method == "GET":
        docs = item.documents.select_related("collection").prefetch_related("tags")
        return Response({**collection_data(item), "documents": [document_data(doc, request.user) for doc in docs]})
    if request.method == "DELETE": item.delete(); return Response(status=204)
    for field in ("name", "description", "accent"):
        if field in request.data: setattr(item, field, (request.data[field] or "").strip())
    item.save(); return Response(collection_data(item))


def validate_upload(uploaded):
    extension = Path(uploaded.name).suffix.lower()
    head = uploaded.read(16); uploaded.seek(0)
    if extension == ".pdf" and not head.startswith(b"%PDF-"):
        raise ValueError("The uploaded PDF is not a valid PDF file.")
    if extension == ".png" and not head.startswith(b"\x89PNG\r\n\x1a\n"):
        raise ValueError("The uploaded PNG is not a valid PNG file.")
    if extension in {".jpg", ".jpeg"} and not head.startswith(b"\xff\xd8\xff"):
        raise ValueError("The uploaded image is not a valid JPEG file.")


def extract_pages(uploaded, kind):
    raw = uploaded.read(); uploaded.seek(0)
    if kind in ("txt", "md"):
        text = clean_text(raw.decode("utf-8", errors="replace"))
        if not text: raise ValueError("No readable text was found in this file.")
        return {"1": text}
    if kind == "pdf":
        try:
            import fitz
            pdf = fitz.open(stream=raw, filetype="pdf")
            pages = {str(number): clean_text(page.get_text()) for number, page in enumerate(pdf, start=1)}
            pages = {number: text for number, text in pages.items() if text}
            if not pages: raise ValueError("No readable text was found in this PDF. OCR is required for scanned PDFs.")
            return pages
        except ValueError: raise
        except Exception as error: raise ValueError("The PDF could not be read. It may be corrupt or encrypted.") from error
    try:
        from PIL import Image
        import pytesseract
        text = clean_text(pytesseract.image_to_string(Image.open(__import__("io").BytesIO(raw))))
        if not text: raise ValueError("No readable text was found in this image.")
        return {"1": text}
    except ValueError: raise
    except Exception as error: raise ValueError("Image OCR is unavailable or the image could not be read.") from error


def index_document(document):
    """Rebuild document chunks atomically enough to avoid duplicate retrieval records."""
    Chunk.objects.filter(document=document).delete()
    chunks = []
    for page, text in document.page_text.items():
        for ordinal, value in enumerate(chunk_text(text, settings.CHUNK_CHARS, settings.CHUNK_OVERLAP), start=1):
            chunks.append(Chunk(owner=document.owner, document=document, page_number=int(page), ordinal=ordinal, text=value))
    Chunk.objects.bulk_create(chunks)
    return chunks


def ensure_indexed(documents):
    """Backfill chunks for documents uploaded before chunk persistence was introduced."""
    for document in documents.filter(chunks__isnull=True).exclude(page_text={} ).distinct():
        index_document(document)


def document_type(name):
    ext = Path(name).suffix.lower().lstrip(".")
    return "image" if ext in {"png", "jpg", "jpeg"} else ext


def assign_tags(document, user, tags):
    if isinstance(tags, str): tags = [tag.strip() for tag in tags.split(",")]
    selected = []
    for name in (tags or [])[:20]:
        name = str(name).strip()
        if name:
            tag, _ = Tag.objects.get_or_create(owner=user, name=name)
            selected.append(tag)
    document.tags.set(selected)


@api_view(["GET", "POST"])
def documents(request):
    if request.method == "GET":
        items = Document.objects.filter(owner=request.user).select_related("collection").prefetch_related("tags")
        params = request.query_params
        if params.get("search"):
            items = items.filter(Q(name__icontains=params["search"]) | Q(excerpt__icontains=params["search"]))
        if params.get("type") and params["type"] != "all": items = items.filter(type=params["type"])
        if params.get("collectionId"): items = items.filter(collection_id=params["collectionId"])
        if params.get("tag"): items = items.filter(tags__name__iexact=params["tag"])
        ordering = {"recent": "-created_at", "opened": "-opened_at", "name": "name"}.get(params.get("sort"), "-created_at")
        items = items.order_by(ordering).distinct()
        return Response({"results": [document_data(item, request.user) for item in items], "count": items.count()})
    uploaded = request.FILES.get("file")
    if not uploaded: return Response({"detail": "Choose a file to upload."}, status=400)
    kind = document_type(uploaded.name)
    if kind not in {"pdf", "txt", "md", "image"}: return Response({"detail": "This file type is not supported. Upload a PDF, text, Markdown, PNG or JPG file."}, status=415)
    if not uploaded.size: return Response({"detail": "That file is empty."}, status=400)
    if uploaded.size > settings.MAX_UPLOAD_MB * 1024 * 1024: return Response({"detail": f"That file is larger than {settings.MAX_UPLOAD_MB} MB."}, status=413)
    collection = None
    if request.data.get("collection"):
        try: collection = Collection.objects.get(pk=request.data["collection"], owner=request.user)
        except Collection.DoesNotExist: return Response({"detail": "That collection no longer exists."}, status=404)
    try:
        validate_upload(uploaded)
    except ValueError as error_value:
        return Response({"detail": str(error_value)}, status=415)
    try:
        page_text = extract_pages(uploaded, kind)
        full_text = " ".join(page_text.values())
        status_value, error = "ready", None
    except ValueError as error_value:
        page_text, full_text, status_value, error = {}, "", "failed", str(error_value)
    doc = Document.objects.create(owner=request.user, collection=collection, name=Path(uploaded.name).name, file=uploaded, type=kind,
                                  size=uploaded.size, pages=max(1, len(page_text)), status=status_value, progress=100,
                                  error=error, excerpt=(full_text[:220] + ("…" if len(full_text) > 220 else "")), page_text=page_text)
    if status_value == "ready": index_document(doc)
    assign_tags(doc, request.user, request.data.getlist("tags") or request.data.get("tags", []))
    record(request.user, "upload", doc.name, f"Added to {collection.name}" if collection else "Added to your library")
    return Response(document_data(doc, request.user), status=201)


@api_view(["GET", "PATCH", "DELETE"])
def document_detail(request, pk):
    try: doc = Document.objects.select_related("collection").prefetch_related("tags").get(pk=pk, owner=request.user)
    except Document.DoesNotExist: return Response({"detail": "That document no longer exists."}, status=404)
    if request.method == "GET":
        data = document_data(doc, request.user, detail=True); doc.opened_at = timezone.now(); doc.save(update_fields=["opened_at"]); return Response(data)
    if request.method == "DELETE": doc.delete(); return Response(status=204)
    if "name" in request.data and str(request.data["name"]).strip(): doc.name = str(request.data["name"]).strip()
    if "lastPage" in request.data: doc.last_page = max(1, int(request.data["lastPage"]))
    if "collectionId" in request.data:
        value = request.data["collectionId"]
        if value is None: doc.collection = None
        else:
            try: doc.collection = Collection.objects.get(pk=value, owner=request.user)
            except Collection.DoesNotExist: return Response({"detail": "That collection no longer exists."}, status=404)
    doc.save()
    if "tags" in request.data: assign_tags(doc, request.user, request.data["tags"])
    return Response(document_data(doc, request.user))


@api_view(["GET"])
def document_status(request, pk):
    try: doc = Document.objects.get(pk=pk, owner=request.user)
    except Document.DoesNotExist: return Response({"detail": "That document no longer exists."}, status=404)
    return Response({"id": str(doc.id), "status": doc.status, "progress": doc.progress, "error": doc.error})


@api_view(["POST"])
def summarize(request, pk):
    try: doc = Document.objects.get(pk=pk, owner=request.user)
    except Document.DoesNotExist: return Response({"detail": "That document no longer exists."}, status=404)
    text = " ".join(doc.page_text.values())
    summary, degraded, reason = summarize_with_llm(doc, settings)
    response = {"summary": summary or text[:900] or f"{doc.name} has no extractable text yet.", "sources": [source_data(doc, 1, text)] if text else [], "degraded": degraded}
    if reason: response["degradedReason"] = reason
    return Response(response)


@api_view(["POST"])
def search(request):
    query = (request.data.get("query") or "").strip()
    if not query: return Response({"results": [], "count": 0, "query": query})
    docs = Document.objects.filter(owner=request.user).select_related("collection").prefetch_related("tags")
    if request.data.get("collection"): docs = docs.filter(collection_id=request.data["collection"])
    ensure_indexed(docs)
    terms = [term.lower() for term in re.findall(r"\w+", query) if len(term) > 1]
    results = []
    chunks = Chunk.objects.filter(owner=request.user, document__in=docs).select_related("document", "document__collection").prefetch_related("document__tags")
    for chunk in chunks:
        score = score_chunk(query, chunk.text)
        if score >= settings.RETRIEVAL_MIN_SCORE:
            doc = chunk.document
            results.append({"id": str(chunk.id), "documentId": str(doc.id), "documentName": doc.name, "documentType": doc.type,
                            "collectionName": doc.collection.name if doc.collection else None, "page": chunk.page_number, "score": min(1.0, score / 3),
                            "tags": sorted(doc.tags.values_list("name", flat=True)), "excerpt": chunk.text[:600]})
    results.sort(key=lambda item: item["score"], reverse=True)
    history, _ = SearchHistory.objects.update_or_create(owner=request.user, query=query, defaults={"result_count": len(results)})
    record(request.user, "search", query, f"{len(results)} results")
    return Response({"results": results[:int(request.data.get("limit", 20))], "count": len(results), "query": query})


@api_view(["GET", "DELETE"])
def search_history(request):
    if request.method == "DELETE": SearchHistory.objects.filter(owner=request.user).delete(); return Response(status=204)
    rows = SearchHistory.objects.filter(owner=request.user).order_by("-created_at")[:20]
    return Response({"results": [{"id": str(row.id), "query": row.query, "at": iso(row.created_at), "resultCount": row.result_count} for row in rows]})


def session_data(session, include_messages=False):
    data = {"id": str(session.id), "title": session.title, "updatedAt": iso(session.updated_at), "scope": session.scope}
    if include_messages:
        data["messages"] = [{"id": str(item.id), "role": item.role, "content": item.content, "at": iso(item.created_at), "sources": item.sources} for item in session.messages.all()]
    else: data["messageCount"] = session.messages.count()
    return data


@api_view(["GET", "POST"])
def sessions(request):
    if request.method == "GET":
        rows = ChatSession.objects.filter(owner=request.user).order_by("-updated_at")
        return Response({"results": [session_data(row) for row in rows]})
    scope = request.data.get("scope") or {"type": "all"}
    session = ChatSession.objects.create(owner=request.user, scope=scope)
    return Response(session_data(session, include_messages=True), status=201)


@api_view(["GET", "PATCH", "DELETE"])
def session_detail(request, pk):
    try: session = ChatSession.objects.get(pk=pk, owner=request.user)
    except ChatSession.DoesNotExist: return Response({"detail": "That conversation no longer exists."}, status=404)
    if request.method == "GET": return Response(session_data(session, include_messages=True))
    if request.method == "DELETE": session.delete(); return Response(status=204)
    if request.data.get("title"): session.title = str(request.data["title"]).strip(); session.save(update_fields=["title"])
    return Response(session_data(session, include_messages=True))


@api_view(["POST"])
def ask(request):
    question = (request.data.get("question") or "").strip()
    if not question: return Response({"detail": "Ask a question first."}, status=400)
    if len(question) > 2000: return Response({"detail": "Questions must be 2,000 characters or fewer."}, status=400)
    session_id = request.data.get("session")
    if session_id:
        try: session = ChatSession.objects.get(pk=session_id, owner=request.user)
        except ChatSession.DoesNotExist: return Response({"detail": "That conversation no longer exists."}, status=404)
    else: session = ChatSession.objects.create(owner=request.user, title=question[:42], scope={"type": "all"})
    docs = Document.objects.filter(owner=request.user)
    if request.data.get("collection"): docs = docs.filter(collection_id=request.data["collection"])
    if request.data.get("documents"):
        docs = docs.filter(id__in=request.data["documents"])
    ensure_indexed(docs)
    chunks = Chunk.objects.filter(owner=request.user, document__in=docs).select_related("document")
    ranked = [(score_chunk(question, chunk.text), chunk) for chunk in chunks]
    ranked = [item for item in ranked if item[0] >= settings.RETRIEVAL_MIN_SCORE]
    ranked.sort(key=lambda item: item[0], reverse=True)
    selected = [chunk for _, chunk in ranked[:settings.RETRIEVAL_TOP_K]]
    history = list(session.messages.order_by("-created_at")[:4])[::-1]
    answer, source_chunks, degraded, reason = synthesize_answer(question, selected, history, settings)
    sources = [source_data(chunk.document, chunk.page_number, chunk.text) for chunk in source_chunks]
    ChatMessage.objects.create(session=session, role="user", content=question)
    ChatMessage.objects.create(session=session, role="assistant", content=answer, sources=sources)
    session.updated_at = timezone.now(); session.save(update_fields=["updated_at"])
    record(request.user, "ask", question, f"{len(sources)} sources")
    response = {"answer": answer, "sources": sources, "session": session_data(session, include_messages=True), "degraded": degraded}
    if reason: response["degradedReason"] = reason
    return Response(response)


@api_view(["GET", "POST"])
def bookmarks(request):
    if request.method == "GET":
        rows = Bookmark.objects.filter(owner=request.user).select_related("document").order_by("-created_at")
        return Response({"results": [bookmark_data(row) for row in rows], "count": rows.count()})
    try: doc = Document.objects.get(pk=request.data.get("documentId"), owner=request.user)
    except Document.DoesNotExist: return Response({"detail": "That document no longer exists."}, status=404)
    page = int(request.data.get("page", 1)); excerpt = request.data.get("excerpt") or doc.page_text.get(str(page), "")[:500]
    item, created = Bookmark.objects.update_or_create(owner=request.user, document=doc, page=page, defaults={"excerpt": excerpt[:500], "note": request.data.get("note") or ""})
    if created: record(request.user, "bookmark", doc.name, f"Page {page}")
    return Response(bookmark_data(item), status=201 if created else 200)


@api_view(["DELETE"])
def bookmark_detail(request, pk):
    try: item = Bookmark.objects.get(pk=pk, owner=request.user)
    except Bookmark.DoesNotExist: return Response({"detail": "That bookmark no longer exists."}, status=404)
    item.delete(); return Response(status=204)


@api_view(["GET"])
def activity(request):
    rows = Activity.objects.filter(owner=request.user).order_by("-created_at")[:8]
    return Response({"results": [{"id": str(row.id), "kind": row.kind, "label": row.label, "detail": row.detail, "at": iso(row.created_at)} for row in rows],
                     "suggestions": ["What is 2NF?", "Explain circular queue.", "Summarize my latest document."]})
