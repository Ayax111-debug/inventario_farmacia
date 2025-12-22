from .models import UsuarioCustom
from rest_framework import serializers

class UsuarioListaSerializer(serializers.ModelSerializer):
    class Meta:
        model = UsuarioCustom

        fields = [
            'id', 
            'username', 
            'email', 
            'first_name', 
            'last_name',  
            'rut',   
            'is_active'     
        ]


class UsuarioRegistroSerializer(serializers.ModelSerializer):
    
    password = serializers.CharField(
        write_only=True, 
        required=True, 
        style={'input_type': 'password'}
    )

    class Meta:
        model = UsuarioCustom
        fields = ['username', 'email', 'password', 'rut']

    def create(self, validated_data):
       
        password = validated_data.pop('password', None)
        
        instance = self.Meta.model(**validated_data)
        
        if password is not None:
            instance.set_password(password)
        
        instance.save()
        return instance