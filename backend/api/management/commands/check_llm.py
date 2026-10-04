import time

from django.conf import settings
from django.core.management.base import BaseCommand, CommandError

from api.services import LLMFailure, OpenAICompatibleClient, provider_host


HINTS = {
    "not_configured": "Set the missing configuration in backend/.env.",
    "auth": "The key is wrong or revoked. Create a new key in the Groq console and update backend/.env.",
    "model": "This model id is not available. Run check_llm --list-models and set LLM_MODEL to one of them.",
    "rate_limit": "Free-tier limit reached. Wait a minute or use a smaller model.",
    "empty": "The model returned no text. Raise LLM_MAX_TOKENS or set LLM_REASONING_EFFORT=low.",
    "timeout": "Could not reach the API. Check internet access from Docker, or raise LLM_TIMEOUT_SECONDS.",
    "network": "Could not reach the API. Check internet access from Docker, or raise LLM_TIMEOUT_SECONDS.",
}


class Command(BaseCommand):
    help = "Check the configured LLM provider without exposing credentials."

    def add_arguments(self, parser):
        parser.add_argument("--list-models", action="store_true")

    def handle(self, *args, **options):
        key_state = "set (hidden)" if settings.LLM_API_KEY else "missing"
        self.stdout.write(f"provider: {settings.LLM_PROVIDER}")
        self.stdout.write(f"base URL host: {provider_host(settings) or 'missing'}")
        self.stdout.write(f"model: {settings.LLM_MODEL or 'missing'}")
        self.stdout.write(f"key: {key_state}")
        if settings.LLM_PROVIDER == "extractive":
            raise CommandError("not_configured: LLM_PROVIDER is extractive; set it to groq to test Groq.")
        missing = []
        if not settings.LLM_API_KEY: missing.append("LLM_API_KEY or GROQ_API_KEY")
        if not settings.LLM_BASE_URL: missing.append("LLM_BASE_URL")
        if options["list_models"]:
            if missing: raise CommandError(f"not_configured: Missing {', '.join(missing)}")
            client = OpenAICompatibleClient(settings)
            try:
                for model in client.list_models(): self.stdout.write(model)
            except LLMFailure as failure:
                detail = f"{failure.code}: HTTP {failure.status or 'n/a'}: {failure.message}"
                hint = HINTS.get(failure.code, "Check provider configuration and logs.")
                raise CommandError(f"{detail}\n{hint}")
            return
        if not settings.LLM_MODEL: missing.append("LLM_MODEL")
        if missing: raise CommandError(f"not_configured: Missing {', '.join(missing)}")
        client = OpenAICompatibleClient(settings)
        try:
            started = time.monotonic()
            answer = client.generate([{"role": "user", "content": "Reply with the single word: ok"}])
            elapsed = round((time.monotonic() - started) * 1000)
            self.stdout.write(self.style.SUCCESS(f"OK ({elapsed} ms): {answer}"))
        except LLMFailure as failure:
            detail = f"{failure.code}: HTTP {failure.status or 'n/a'}: {failure.message}"
            hint = HINTS.get(failure.code, "Check provider configuration and logs.")
            raise CommandError(f"{detail}\n{hint}")
