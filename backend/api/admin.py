from django.contrib import admin
from .models import Activity, Bookmark, ChatMessage, ChatSession, Chunk, Collection, Document, SearchHistory, Tag, User

for model in [User, Collection, Tag, Document, Chunk, Bookmark, SearchHistory, ChatSession, ChatMessage, Activity]:
    admin.site.register(model)
