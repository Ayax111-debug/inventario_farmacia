from django.db import models
from django.contrib.auth.models import AbstractUser



#Modelo de usuario aprovechando las cualidades del usuario de DJANGO
class UsuarioCustom(AbstractUser):

    rut = models.CharField(max_length=10,blank=True,null=True)



    def __str__(self):
        return f"{self.username}({self.get_full_name()})"
    