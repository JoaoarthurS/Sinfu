package com.sinfu

import android.app.NotificationChannel
import android.app.NotificationManager
import android.app.PendingIntent
import android.content.Context
import android.content.Intent
import android.graphics.Bitmap
import android.graphics.BitmapFactory
import android.media.RingtoneManager
import android.os.Build
import androidx.core.app.NotificationCompat
import com.google.firebase.messaging.FirebaseMessagingService
import com.google.firebase.messaging.RemoteMessage
import java.net.HttpURLConnection
import java.net.URL

class MyFirebaseMessagingService : FirebaseMessagingService() {

    override fun onMessageReceived(remoteMessage: RemoteMessage) {
        // Verificar se a mensagem contém dados ou notificação
        if (remoteMessage.data.isNotEmpty() || remoteMessage.notification != null) {
            sendNotification(remoteMessage)
        }
    }

    private fun sendNotification(remoteMessage: RemoteMessage) {
        val link = remoteMessage.data["link"]
        val title = remoteMessage.notification?.title ?: remoteMessage.data["title"] ?: "Notificação"
        val body = remoteMessage.notification?.body ?: remoteMessage.data["body"] ?: ""
        // Inclui o link no texto exibido para que ele apareça na notificação.
        val displayText = if (!link.isNullOrEmpty()) {
            if (body.isNotBlank()) "$body\n\n$link" else link
        } else {
            body
        }

        // Ao tocar, sempre abre o aplicativo (não redireciona para o link).
        val intent = Intent(this, MainActivity::class.java).apply {
            addFlags(Intent.FLAG_ACTIVITY_CLEAR_TOP)
        }

        val pendingIntentFlags = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
            PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
        } else {
            PendingIntent.FLAG_UPDATE_CURRENT
        }

        // Request code único por notificação para não reutilizar PendingIntents
        // de links diferentes.
        val requestCode = System.currentTimeMillis().toInt()
        val pendingIntent = PendingIntent.getActivity(
            this, requestCode, intent, pendingIntentFlags
        )

        val channelId = "default_notification_channel"
        val defaultSoundUri = RingtoneManager.getDefaultUri(RingtoneManager.TYPE_NOTIFICATION)
        
        val notificationBuilder = NotificationCompat.Builder(this, channelId)
            .setSmallIcon(R.mipmap.ic_launcher)
            .setContentTitle(title)
            .setContentText(displayText)
            .setAutoCancel(true)
            .setSound(defaultSoundUri)
            .setContentIntent(pendingIntent)
            .setPriority(NotificationCompat.PRIORITY_HIGH)

        // Tentar obter imagem da notificação ou dos dados
        val imageUrl = remoteMessage.notification?.imageUrl?.toString() 
            ?: remoteMessage.data["image_url"]
            ?: remoteMessage.data["imageUrl"]

        if (!imageUrl.isNullOrEmpty()) {
            val bitmap = getBitmapFromUrl(imageUrl)
            if (bitmap != null) {
                val bigPicture = NotificationCompat.BigPictureStyle()
                    .bigPicture(bitmap)
                    .bigLargeIcon(null as Bitmap?)
                // Mostra o texto (incluindo o link) como resumo ao expandir a imagem.
                if (displayText.isNotBlank()) {
                    bigPicture.setSummaryText(displayText)
                }
                notificationBuilder.setStyle(bigPicture)
                notificationBuilder.setLargeIcon(bitmap)
            } else {
                // Falha ao baixar a imagem: ainda mostra o texto completo (com link).
                notificationBuilder.setStyle(
                    NotificationCompat.BigTextStyle().bigText(displayText)
                )
            }
        } else {
            // Se não houver imagem, usar BigTextStyle para texto expandido
            notificationBuilder.setStyle(
                NotificationCompat.BigTextStyle()
                    .bigText(displayText)
            )
        }

        val notificationManager = getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager

        // Criar canal de notificação para Android O+
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            val channel = NotificationChannel(
                channelId,
                "Notificações Push",
                NotificationManager.IMPORTANCE_HIGH
            ).apply {
                description = "Canal para notificações push do app"
                enableVibration(true)
            }
            notificationManager.createNotificationChannel(channel)
        }

        notificationManager.notify(System.currentTimeMillis().toInt(), notificationBuilder.build())
    }

    private fun getBitmapFromUrl(imageUrl: String): Bitmap? {
        var connection: HttpURLConnection? = null
        return try {
            val url = URL(imageUrl)
            connection = (url.openConnection() as HttpURLConnection).apply {
                instanceFollowRedirects = true
                connectTimeout = 15000
                readTimeout = 15000
                doInput = true
                // Accept de imagem (sem text/html) e header de bypass evitam que
                // proxies como o ngrok devolvam uma pagina HTML de aviso no lugar
                // da imagem. UA proprio em vez do padrao "Java/...".
                setRequestProperty("Accept", "image/*")
                setRequestProperty("User-Agent", "UniNotesApp-Android")
                setRequestProperty("ngrok-skip-browser-warning", "true")
            }
            connection.connect()

            if (connection.responseCode !in 200..299) {
                return null
            }

            connection.inputStream.use { input ->
                BitmapFactory.decodeStream(input)
            }
        } catch (e: Exception) {
            e.printStackTrace()
            null
        } finally {
            connection?.disconnect()
        }
    }

    override fun onNewToken(token: String) {
        // Quando um novo token é gerado, ele pode ser enviado para o servidor
        // Isso já está sendo tratado no FirebaseMessagingService.ts
    }
}
