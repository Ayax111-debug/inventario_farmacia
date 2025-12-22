from django.shortcuts import render
from rest_framework import viewsets
from .models import UsuarioCustom
from .serializers import UsuarioListaSerializer, UsuarioRegistroSerializer

class UsuarioViewSet(viewsets.ModelViewSet):
    queryset = UsuarioCustom.objects.all()
    
    def get_serializer_class(self):
        
        if self.action == 'create':
            return UsuarioRegistroSerializer
        
        return UsuarioListaSerializer

