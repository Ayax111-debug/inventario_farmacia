from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import UsuarioCustom


class CustomUserAdmin(UserAdmin):
    model = UsuarioCustom

    list_display = ['username','email','rut','is_staff']


    fieldsets = UserAdmin.fieldsets + (
        ('Información extra',{'fields':('rut',)}),
    )

    add_fieldsets = UserAdmin.add_fieldsets + (
        (None,{'fields':('rut',)}),
    )

admin.site.register(UsuarioCustom, CustomUserAdmin)





