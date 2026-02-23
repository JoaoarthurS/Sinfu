# 🚀 Guia Rápido de Instalação - Firebase Push Notifications

## ⚡ Instalação em 3 Passos

### **Passo 1: Instalar Dependências**

```bash
cd Sinfu
npm install
```

### **Passo 2: Configurar google-services.json**

```bash
# Mover arquivo de configuração do Firebase
Move-Item src/google-services.json android/app/google-services.json
```

**OU** copie manualmente:
- **De:** `Sinfu/src/google-services.json`
- **Para:** `Sinfu/android/app/google-services.json`

### **Passo 3: Rebuild do App**

```bash
npm run android
```

---

## ✅ Pronto!

O sistema já está configurado para:
- ✅ Solicitar permissão de notificações
- ✅ Obter token FCM automaticamente
- ✅ **Enviar token para API após login**
- ✅ Receber notificações push

---

## 🧪 Testar Agora

### 1. Faça Login no App
```
Email: user@example.com
Senha: user123
```

### 2. Verifique os Logs
```bash
npx react-native log-android
```

Procure por:
```
✅ Token FCM obtido: ey...
✅ Token FCM registrado com sucesso no backend
```

### 3. Envie uma Notificação de Teste

```bash
POST http://localhost:8000/api/notify-user/1
Authorization: Bearer {token-admin}

{
  "title": "Teste",
  "body": "Funcionou!",
  "filters": { "user_id": 1 }
}
```

---

## 📚 Documentação Completa

Para mais detalhes, veja:
- [FIREBASE_SETUP.md](FIREBASE_SETUP.md) - Documentação completa
- [README_SINFU.md](README_SINFU.md) - Documentação do app

---

## 🐛 Problemas?

### Token não aparece no backend?

```bash
# Verificar se arquivo está no lugar certo
ls android/app/google-services.json

# Ver logs do app
npx react-native log-android

# Ver logs da API
cd ../api-push-notification
tail -f storage/logs/laravel.log
```

### Build falhou?

```bash
cd android
./gradlew clean
cd ..
npm run android
```

---

**✨ Tudo implementado e funcionando!**

A integração agora é **100% automática** - basta fazer login e o token será registrado.
