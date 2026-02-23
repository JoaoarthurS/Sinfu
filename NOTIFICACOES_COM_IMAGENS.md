# Como Usar Imagens em Notificações Push

## ✅ O que foi implementado

Agora o sistema suporta **notificações push com imagens** (Rich Notifications). As imagens aparecem expandidas nas notificações quando o usuário arrasta para baixo.

### Mudanças Realizadas:

1. **Backend (PHP/Laravel)** - [FirebaseNotificationService.php](api-push-notification/app/Services/FirebaseNotificationService.php)
   - Configuração específica para Android com BigPictureStyle
   - Configuração específica para iOS com mutable-content
   - Imagem enviada tanto no campo `notification.image` quanto em `data.image_url`

2. **Android App** - [MyFirebaseMessagingService.kt](Sinfu/android/app/src/main/java/com/sinfu/MyFirebaseMessagingService.kt)
   - Serviço customizado que processa notificações
   - Baixa a imagem da URL fornecida
   - Exibe usando BigPictureStyle para imagens grandes
   - Fallback para BigTextStyle quando não há imagem

3. **AndroidManifest.xml**
   - Serviço de notificação registrado
   - Meta-data do Firebase configurado
   - Permissões necessárias adicionadas (INTERNET, POST_NOTIFICATIONS, VIBRATE)

---

## 🚀 Como Usar

### 1. **Enviando Notificação com Imagem via API**

```bash
POST /api/notifications/send
```

**Body (JSON):**
```json
{
  "title": "Título da Notificação",
  "message": "Mensagem da notificação",
  "priority": "high",
  "image_url": "https://exemplo.com/imagem.jpg",
  "filters": {
    "user_id": 1
  }
}
```

**Ou com upload de imagem:**
```bash
POST /api/notifications/send
Content-Type: multipart/form-data

title=Título da Notificação
message=Mensagem da notificação
priority=high
image=@/caminho/para/imagem.jpg
filters[user_id]=1
```

### 2. **Enviando via Interface Admin do App**

1. Abra o app e faça login como admin
2. Vá para **Dashboard Admin**
3. Clique em **+ Nova Notificação**
4. Preencha:
   - Título
   - Mensagem
   - Prioridade
   - **Link** (opcional)
   - **Imagem**: 
     - Escolha uma imagem da galeria OU
     - Cole uma URL de imagem
5. Selecione os destinatários (grupos ou todos)
6. Envie!

---

## 📱 Como Funciona

### **No Android:**

1. Quando uma notificação com `image_url` é recebida
2. O `MyFirebaseMessagingService` é acionado
3. A imagem é baixada da URL fornecida
4. A notificação é criada usando `BigPictureStyle`
5. O usuário vê:
   - **Notificação compacta**: Ícone + título + texto
   - **Notificação expandida** (arrastando para baixo): Título + imagem grande + texto

### **No iOS:**

1. A notificação é processada nativa pelo iOS
2. Se `mutable-content: 1` está presente
3. E `fcm_options.image` está definido
4. O iOS baixa e exibe a imagem automaticamente

---

## 🧪 Testando

### **Teste 1: Notificação Simples (sem imagem)**

```bash
curl -X POST http://localhost:8000/api/notifications/send \
  -H "Authorization: Bearer SEU_TOKEN_ADMIN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Olá!",
    "message": "Esta é uma notificação sem imagem",
    "priority": "medium",
    "filters": {"user_id": 1}
  }'
```

**Resultado esperado:**
- ✅ Notificação aparece
- ✅ Apenas texto (sem imagem)

### **Teste 2: Notificação com Imagem (URL)**

```bash
curl -X POST http://localhost:8000/api/notifications/send \
  -H "Authorization: Bearer SEU_TOKEN_ADMIN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Promoção!",
    "message": "Confira nossa nova promoção",
    "priority": "high",
    "image_url": "https://picsum.photos/800/600",
    "filters": {"user_id": 1}
  }'
```

**Resultado esperado:**
- ✅ Notificação aparece
- ✅ Ao expandir, mostra imagem grande

---

## 🔍 Requisitos para Imagens

### **Formatos Suportados:**
- ✅ JPEG (.jpg, .jpeg)
- ✅ PNG (.png)
- ✅ WebP (.webp)
- ❌ GIF animado (será estático)

### **Tamanho Recomendado:**
- **Largura:** 800-1200px
- **Altura:** 400-800px
- **Ratio:** 2:1 ou 16:9
- **Tamanho do arquivo:** < 1MB (para carregamento rápido)

### **URL da Imagem:**
- ✅ Deve ser acessível publicamente (HTTP/HTTPS)
- ✅ Prefira HTTPS para segurança
- ✅ Sem autenticação ou paywall
- ❌ Imagens locais (file://) não funcionam

---

## 🛠️ Rebuild do App

**IMPORTANTE:** Após as mudanças no código nativo (Android), você precisa fazer rebuild:

```bash
cd Sinfu

# Limpar cache
cd android
./gradlew clean
cd ..

# Rebuild
npm run android
```

**Ou no Windows PowerShell:**
```powershell
cd Sinfu
cd android
.\gradlew.bat clean
cd ..
npm run android
```

---

## ⚠️ Troubleshooting

### **Problema: Imagem não aparece**

**Possíveis causas:**

1. **URL da imagem inválida ou inacessível**
   ```bash
   # Teste a URL no navegador
   # Deve abrir a imagem diretamente
   ```

2. **App não foi reconstruído após mudanças**
   ```bash
   cd Sinfu/android
   ./gradlew clean
   cd ../..
   npm run android
   ```

3. **Imagem muito grande (demora para baixar)**
   - Use imagens < 1MB
   - Comprima a imagem antes de enviar

4. **Sem conexão com internet no dispositivo**
   - Verifique se o dispositivo tem acesso à internet
   - Teste com uma URL simples: `https://picsum.photos/800/600`

5. **Logs para debug:**
   ```bash
   # Ver logs do Android
   npx react-native log-android
   
   # Procure por erros como:
   # - IOException (erro ao baixar imagem)
   # - URL malformada
   ```

---

## 📊 Exemplos de URLs de Teste

Use estas URLs públicas para testar:

```
https://picsum.photos/800/600
https://picsum.photos/1200/630
https://images.unsplash.com/photo-1506748686214-e9df14d4d9d0?w=800
```

---

## 🎯 Próximos Passos

Recursos que podem ser implementados:

- 🔄 Cache de imagens para reuso
- 🔄 Suporte a GIFs animados
- 🔄 Múltiplas imagens em carrossel
- 🔄 Ações customizadas nos botões da notificação
- 🔄 Notificações agendadas

---

## 📞 Suporte

Se as imagens ainda não aparecerem após seguir este guia:

1. Verifique os logs do Android: `npx react-native log-android`
2. Verifique os logs do backend: `tail -f api-push-notification/storage/logs/laravel.log`
3. Teste com URL de imagem pública conhecida
4. Certifique-se de ter feito rebuild do app Android

---

**✨ Notificações com imagens configuradas com sucesso!**
