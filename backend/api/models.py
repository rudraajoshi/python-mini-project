import uuid
from django.contrib.auth.models import AbstractUser, BaseUserManager
from django.db import models


class UserManager(BaseUserManager):
    def create_user(self, email, password=None, **extra):
        if not email:
            raise ValueError("Email is required")
        user = self.model(email=self.normalize_email(email).lower(), **extra)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, email, password=None, **extra):
        extra.setdefault("is_staff", True); extra.setdefault("is_superuser", True)
        return self.create_user(email, password, **extra)


class UUIDModel(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    class Meta:
        abstract = True


class User(AbstractUser, UUIDModel):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    username = None
    email = models.EmailField(unique=True)
    name = models.CharField(max_length=150)
    USERNAME_FIELD = "email"
    REQUIRED_FIELDS = ["name"]
    objects = UserManager()


class Collection(UUIDModel):
    owner = models.ForeignKey(User, on_delete=models.CASCADE, related_name="collections")
    name = models.CharField(max_length=120)
    description = models.CharField(max_length=500, blank=True)
    accent = models.CharField(max_length=7, default="#4F6DF5")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    class Meta:
        unique_together = ("owner", "name")


class Tag(UUIDModel):
    owner = models.ForeignKey(User, on_delete=models.CASCADE)
    name = models.CharField(max_length=40)
    class Meta:
        unique_together = ("owner", "name")


class Document(UUIDModel):
    owner = models.ForeignKey(User, on_delete=models.CASCADE, related_name="documents")
    collection = models.ForeignKey(Collection, on_delete=models.SET_NULL, null=True, blank=True, related_name="documents")
    name = models.CharField(max_length=255)
    file = models.FileField(upload_to="uploads/%Y/%m/%d", blank=True)
    type = models.CharField(max_length=8)
    size = models.PositiveBigIntegerField(default=0)
    pages = models.PositiveIntegerField(default=1)
    status = models.CharField(max_length=20, default="ready")
    progress = models.PositiveSmallIntegerField(default=100)
    error = models.TextField(blank=True, null=True)
    excerpt = models.TextField(blank=True)
    page_text = models.JSONField(default=dict)
    tags = models.ManyToManyField(Tag, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    opened_at = models.DateTimeField(null=True, blank=True)
    last_page = models.PositiveIntegerField(default=1)


class Chunk(UUIDModel):
    """A page-bounded, retrievable portion of a document."""
    owner = models.ForeignKey(User, on_delete=models.CASCADE, related_name="chunks")
    document = models.ForeignKey(Document, on_delete=models.CASCADE, related_name="chunks")
    page_number = models.PositiveIntegerField()
    ordinal = models.PositiveIntegerField()
    text = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)
    class Meta:
        unique_together = ("document", "page_number", "ordinal")
        indexes = [models.Index(fields=["owner", "document"], name="api_chunk_owner_i_6c7422_idx")]


class Bookmark(UUIDModel):
    owner = models.ForeignKey(User, on_delete=models.CASCADE)
    document = models.ForeignKey(Document, on_delete=models.CASCADE)
    page = models.PositiveIntegerField()
    excerpt = models.CharField(max_length=500, blank=True)
    note = models.CharField(max_length=500, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    class Meta:
        unique_together = ("owner", "document", "page")


class SearchHistory(UUIDModel):
    owner = models.ForeignKey(User, on_delete=models.CASCADE)
    query = models.CharField(max_length=500)
    result_count = models.PositiveIntegerField(default=0)
    created_at = models.DateTimeField(auto_now=True)


class ChatSession(UUIDModel):
    owner = models.ForeignKey(User, on_delete=models.CASCADE)
    title = models.CharField(max_length=200, default="New conversation")
    scope = models.JSONField(default=dict)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)


class ChatMessage(UUIDModel):
    session = models.ForeignKey(ChatSession, on_delete=models.CASCADE, related_name="messages")
    role = models.CharField(max_length=10)
    content = models.TextField()
    sources = models.JSONField(default=list, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)


class Activity(UUIDModel):
    owner = models.ForeignKey(User, on_delete=models.CASCADE)
    kind = models.CharField(max_length=20)
    label = models.CharField(max_length=255)
    detail = models.CharField(max_length=255)
    created_at = models.DateTimeField(auto_now_add=True)
