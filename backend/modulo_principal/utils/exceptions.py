from django.core.exceptions import ValidationError as DjangoValidationError
from rest_framework.views import exception_handler
from rest_framework.exceptions import ValidationError as DRFValidationError

def custom_exception_handler(exc, context):

    if isinstance(exc, DjangoValidationError):
        exc = DRFValidationError(detail=exc.message_dict)
    
    return exception_handler(exc, context)

