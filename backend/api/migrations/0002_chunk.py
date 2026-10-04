import uuid
from django.conf import settings
from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):
    dependencies = [("api", "0001_initial")]

    operations = [
        migrations.CreateModel(
            name="Chunk",
            fields=[
                ("id", models.UUIDField(default=uuid.uuid4, editable=False, primary_key=True, serialize=False)),
                ("page_number", models.PositiveIntegerField()),
                ("ordinal", models.PositiveIntegerField()),
                ("text", models.TextField()),
                ("created_at", models.DateTimeField(auto_now_add=True)),
                ("document", models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name="chunks", to="api.document")),
                ("owner", models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name="chunks", to=settings.AUTH_USER_MODEL)),
            ],
            options={"unique_together": {("document", "page_number", "ordinal")}},
        ),
        migrations.AddIndex(model_name="chunk", index=models.Index(fields=["owner", "document"], name="api_chunk_owner_i_6c7422_idx")),
    ]
