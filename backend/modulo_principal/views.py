from django.shortcuts import render
from rest_framework import viewsets
from .models import UsuarioCustom
from .serializers import UsuarioListaSerializer, UsuarioRegistroSerializer
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from django.conf import settings
from rest_framework_simplejwt.exceptions import InvalidToken, TokenError

#aqui estoy trabajando la serialización del modelo de usuario
#vista para definir el uso de crear o leer el usuario
class UsuarioViewSet(viewsets.ModelViewSet):
    queryset = UsuarioCustom.objects.all()
    
    def get_serializer_class(self):
        
        if self.action == 'create':
            return UsuarioRegistroSerializer
        
        return UsuarioListaSerializer



#trabajando con la modificación del guardado de tokens de JWT

class CookieTokenObtainPairView(TokenObtainPairView):
    def post(self, request, *args, **kwargs):

        response = super().post(request, *args, **kwargs)

       

        if response.status_code == 200:
            access_token = response.data.get('access')
            refresh_token = response.data.get('refresh')

            response.set_cookie(
                key=settings.AUTH_COOKIE,
                value=access_token,
                httponly=settings.AUTH_COOKIE_HTTP_ONLY,
                secure=settings.AUTH_COOKIE_SECURE,
                samesite=settings.AUTH_COOKIE_SAMESITE,
                path=settings.AUTH_COOKIE_PATH,
            )

            response.set_cookie(
                key=settings.AUTH_COOKIE_REFRESH,
                value=refresh_token,
                httponly=settings.AUTH_COOKIE_HTTP_ONLY,
                secure=settings.AUTH_COOKIE_SECURE,
                samesite=settings.AUTH_COOKIE_SAMESITE,
                path=settings.AUTH_COOKIE_PATH
            )

            del response.data['access']
            del response.data['refresh']
            response.data['message'] = 'Login exitoso. Cookies establecidas'




        return response




class CookieTokenRefreshView(TokenRefreshView):
    def post(self, request, *args,**kwargs):
        
        refresh_token = request.COOKIES.get(settings.AUTH_COOKIE_REFRESH)

        if refresh_token:
            request.data['refresh'] = refresh_token

        response = super().post(request,*args,**kwargs)

        if response.status_code == 200:
            access_token = response.data.get('access')

            response.set_cookie(
                key=settings.AUTH_COOKIE,
                value=access_token,
                httponly=settings.AUTH_COOKIE_HTTP_ONLY,
                secure=settings.AUTH_COOKIE_SECURE,
                samesite=settings.AUTH_COOKIE_SAMESITE,
                path=settings.AUTH_COOKIE_PATH
            )

            

            del response.data['access']
            if 'refresh' in response.data:
                del response.data['refresh']

            response.data['message'] = 'Token refrescado exitosamente'

        return response
        

class LogoutView(APIView):
    def post(self, request):
        response = Response({"message":"Logout exitoso"},status=status.HTTP_200_OK)

        response.delete_cookie(settings.AUTH_COOKIE)
        response.delete_cookie(settings.AUTH_COOKIE_REFRESH)
        return response