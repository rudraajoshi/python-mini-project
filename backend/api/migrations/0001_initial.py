# Generated manually because the current workstation has no Python runtime.
import uuid
from django.conf import settings
from api.models import UserManager
from django.db import migrations, models
import django.db.models.deletion
import django.utils.timezone


class Migration(migrations.Migration):
    initial = True
    dependencies = [("auth", "0012_alter_user_first_name_max_length")]

    operations = [
        migrations.CreateModel(
            name="User",
            fields=[
                ("password", models.CharField(max_length=128, verbose_name="password")),
                ("last_login", models.DateTimeField(blank=True, null=True, verbose_name="last login")),
                ("is_superuser", models.BooleanField(default=False, help_text="Designates that this user has all permissions without explicitly assigning them.", verbose_name="superuser status")),
                ("id", models.UUIDField(default=uuid.uuid4, editable=False, primary_key=True, serialize=False)),
                ("first_name", models.CharField(blank=True, max_length=150, verbose_name="first name")),
                ("last_name", models.CharField(blank=True, max_length=150, verbose_name="last name")),
                ("email", models.EmailField(max_length=254, unique=True)),
                ("is_staff", models.BooleanField(default=False, help_text="Designates whether the user can log into this admin site.", verbose_name="staff status")),
                ("is_active", models.BooleanField(default=True, help_text="Designates whether this user should be treated as active. Unselect this instead of deleting accounts.", verbose_name="active")),
                ("date_joined", models.DateTimeField(default=django.utils.timezone.now, verbose_name="date joined")),
                ("name", models.CharField(max_length=150)),
                ("groups", models.ManyToManyField(blank=True, help_text="The groups this user belongs to. A user will get all permissions granted to each of their groups.", related_name="user_set", related_query_name="user", to="auth.group", verbose_name="groups")),
                ("user_permissions", models.ManyToManyField(blank=True, help_text="Specific permissions for this user.", related_name="user_set", related_query_name="user", to="auth.permission", verbose_name="user permissions")),
            ],
            options={"verbose_name": "user", "verbose_name_plural": "users", "abstract": False},
            managers=[("objects", UserManager())],
        ),
        migrations.CreateModel(name="Collection", fields=[
            ("id", models.UUIDField(default=uuid.uuid4, editable=False, primary_key=True, serialize=False)),
            ("name", models.CharField(max_length=120)), ("description", models.CharField(blank=True, max_length=500)),
            ("accent", models.CharField(default="#4F6DF5", max_length=7)), ("created_at", models.DateTimeField(auto_now_add=True)),
            ("updated_at", models.DateTimeField(auto_now=True)),
            ("owner", models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name="collections", to=settings.AUTH_USER_MODEL)),
        ], options={"unique_together": {("owner", "name")}}),
        migrations.CreateModel(name="Tag", fields=[
            ("id", models.UUIDField(default=uuid.uuid4, editable=False, primary_key=True, serialize=False)),
            ("name", models.CharField(max_length=40)),
            ("owner", models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to=settings.AUTH_USER_MODEL)),
        ], options={"unique_together": {("owner", "name")}}),
        migrations.CreateModel(name="Document", fields=[
            ("id", models.UUIDField(default=uuid.uuid4, editable=False, primary_key=True, serialize=False)),
            ("name", models.CharField(max_length=255)), ("file", models.FileField(blank=True, upload_to="uploads/%Y/%m/%d")),
            ("type", models.CharField(max_length=8)), ("size", models.PositiveBigIntegerField(default=0)),
            ("pages", models.PositiveIntegerField(default=1)), ("status", models.CharField(default="ready", max_length=20)),
            ("progress", models.PositiveSmallIntegerField(default=100)), ("error", models.TextField(blank=True, null=True)),
            ("excerpt", models.TextField(blank=True)), ("page_text", models.JSONField(default=dict)),
            ("created_at", models.DateTimeField(auto_now_add=True)), ("updated_at", models.DateTimeField(auto_now=True)),
            ("opened_at", models.DateTimeField(blank=True, null=True)), ("last_page", models.PositiveIntegerField(default=1)),
            ("collection", models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, related_name="documents", to="api.collection")),
            ("owner", models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name="documents", to=settings.AUTH_USER_MODEL)),
            ("tags", models.ManyToManyField(blank=True, to="api.tag")),
        ]),
        migrations.CreateModel(name="Bookmark", fields=[
            ("id", models.UUIDField(default=uuid.uuid4, editable=False, primary_key=True, serialize=False)), ("page", models.PositiveIntegerField()),
            ("excerpt", models.CharField(blank=True, max_length=500)), ("note", models.CharField(blank=True, max_length=500)),
            ("created_at", models.DateTimeField(auto_now_add=True)),
            ("document", models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to="api.document")),
            ("owner", models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to=settings.AUTH_USER_MODEL)),
        ], options={"unique_together": {("owner", "document", "page")}}),
        migrations.CreateModel(name="SearchHistory", fields=[
            ("id", models.UUIDField(default=uuid.uuid4, editable=False, primary_key=True, serialize=False)), ("query", models.CharField(max_length=500)),
            ("result_count", models.PositiveIntegerField(default=0)), ("created_at", models.DateTimeField(auto_now=True)),
            ("owner", models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to=settings.AUTH_USER_MODEL)),
        ]),
        migrations.CreateModel(name="ChatSession", fields=[
            ("id", models.UUIDField(default=uuid.uuid4, editable=False, primary_key=True, serialize=False)),
            ("title", models.CharField(default="New conversation", max_length=200)), ("scope", models.JSONField(default=dict)),
            ("created_at", models.DateTimeField(auto_now_add=True)), ("updated_at", models.DateTimeField(auto_now=True)),
            ("owner", models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to=settings.AUTH_USER_MODEL)),
        ]),
        migrations.CreateModel(name="ChatMessage", fields=[
            ("id", models.UUIDField(default=uuid.uuid4, editable=False, primary_key=True, serialize=False)), ("role", models.CharField(max_length=10)),
            ("content", models.TextField()), ("sources", models.JSONField(blank=True, default=list)), ("created_at", models.DateTimeField(auto_now_add=True)),
            ("session", models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name="messages", to="api.chatsession")),
        ]),
        migrations.CreateModel(name="Activity", fields=[
            ("id", models.UUIDField(default=uuid.uuid4, editable=False, primary_key=True, serialize=False)), ("kind", models.CharField(max_length=20)),
            ("label", models.CharField(max_length=255)), ("detail", models.CharField(max_length=255)), ("created_at", models.DateTimeField(auto_now_add=True)),
            ("owner", models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to=settings.AUTH_USER_MODEL)),
        ]),
    ]
