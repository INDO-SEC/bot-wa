const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const sharp = require('sharp');
const axios = require('axios');
const fs = require('fs');
const os = require('os');

const client = new Client({
    authStrategy: new LocalAuth(),
});

client.on('qr', (qr) => {
    qrcode.generate(qr, { small: true });
});

client.on('ready', () => {
    console.log('Client is ready!');
});

let botActive = true; // Untuk mengontrol status bot

const bannerPath = './banner_kucing_oren.jpg'; // Path untuk banner

// Pesan untuk mengirim banner kucing oren saat bot mulai
client.on('message', async (msg) => {
    if (!botActive && msg.body.toLowerCase() !== '.mulai') {
        return; // Jika bot tidak aktif, abaikan pesan kecuali perintah untuk mengaktifkan
    }

    const chat = await msg.getChat();

    // Memulai bot dan mengirim banner
    if (msg.body.toLowerCase() === '.mulai') {
        botActive = true;
        chat.sendMessage('Bot WhatsApp siap digunakan!', { media: bannerPath });
    }

    // Mematikan bot
    if (msg.body.toLowerCase() === '.stop') {
        botActive = false;
        chat.sendMessage('Bot dimatikan.');
    }

    // Mengunduh video dari pesan media
    if (msg.hasMedia) {
        const media = await msg.downloadMedia();
        const buffer = Buffer.from(media.data, 'base64');
        const videoFile = './downloaded_video.mp4';
        fs.writeFileSync(videoFile, buffer);
        chat.sendMessage('Video telah diunduh!');
    }

    // Membuat meme sederhana
    if (msg.body.toLowerCase() === 'buat meme') {
        const memeFile = './meme.png';
        sharp({
            create: {
                width: 400,
                height: 200,
                channels: 3,
                background: '#ffffff',
            },
        })
            .text("Meme Keren", 50, 100, {
                size: 24,
                font: 'Arial',
            })
            .toFile(memeFile, (err, info) => {
                if (err) console.error(err);
                chat.sendMessage({ attachment: memeFile });
            });
    }

    // Membuat GIF sederhana
    if (msg.body.toLowerCase() === 'buat gif') {
        const gifFile = './simple.gif'; // Tambahkan file GIF
        // Logika pembuatan GIF bisa ditambahkan di sini
        chat.sendMessage({ attachment: gifFile });
    }

    // Mengirim pesan otomatis ke nomor tertentu
    if (msg.body.toLowerCase() === 'kirim pesan') {
        const nomorTujuan = '1234567890'; // Ganti dengan nomor yang dituju
        const pesan = 'Pesan otomatis: Halo!';
        client.sendMessage(nomorTujuan, pesan);
    }

    // Pemantauan status online/offline
    if (msg.body.toLowerCase() === 'cek status') {
        const participants = await chat.getParticipants();
        const onlineUsers = participants.filter(p => p.isOnline);

        if (onlineUsers.length > 0) {
            chat.sendMessage(`Yang online: ${onlineUsers.map(p => p.id.user).join(', ')}`);
        } else {
            chat.sendMessage("Tidak ada yang online.");
        }
    }

    // Obrolan AI
    if (msg.body.toLowerCase() === 'ngobrol ai') {
        chat.sendMessage("Fitur obrolan AI dalam pengembangan.");
    }

    // Mengunduh komik anime
    if (msg.body.toLowerCase() === 'download komik') {
        const comicUrl = 'https://example.com/anime-comic'; // Ganti dengan URL komik
        const response = await axios.get(comicUrl, { responseType: 'arraybuffer' });
        
        const comicFile = './downloaded_comic.pdf'; 
        fs.writeFileSync(comicFile, response.data);

        chat.sendMessage('Komik anime telah diunduh!');
    }

    // Memeriksa informasi jaringan
    if (msg.body.toLowerCase() === 'cek jaringan') {
        const networkInterfaces = os.networkInterfaces();
        let networkInfo = '';

        for (const [name, interfaces] of Object.entries(networkInterfaces)) {
            networkInfo += `Interface: ${name}\n`;
            interfaces.forEach((net) => {
                networkInfo += ` - IP Address: ${net.address}\n`;
            });
        }

        chat.sendMessage(`Informasi Jaringan:\n${networkInfo}`);
    }
});

client.initialize();
