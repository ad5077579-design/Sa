import express from 'express';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(express.json());

const apiKey = process.env.GEMINI_API_KEY;
const ai = new GoogleGenAI({ apiKey: apiKey || '' });

app.post('/api/ai-assist', async (req, res) => {
  try {
    const { prompt, context } = req.body;
    if (!apiKey) {
      return res.json({ response: 'مساعد ذكي مطار بغداد: نوصي بالتوجه قبل ساعتين من موعد إقلاع طائرتك لضمان إنهاء الإجراءات بكل راحية.' });
    }

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: [
        {
          role: 'user',
          parts: [
            {
              text: `أنت مساعد ذكي رسمي لتطبيق "تكسي مطار بغداد الدولي". السياق الحالي: ${JSON.stringify(context || {})}. طلب المستخدم: ${prompt}`
            }
          ]
        }
      ],
      config: {
        systemInstruction: 'أنت مساعد ذكي متخصص في النقل الآمن، تنظيم مواعيد الرحلات إلى مطار بغداد الدولي، وتقديم نصائح المرور (طريق المطار، نقاط السيطرة، صالة المسافرين). أجب دائماً بالعربية الفصحى بلهجة عراقية محترفة ودافئة ومطمئنة.'
      }
    });

    res.json({ response: response.text });
  } catch (err: any) {
    console.error('Gemini AI error:', err);
    res.status(500).json({ error: err.message || 'حدث خطأ في الاتصال بالمساعد الذكي' });
  }
});

if (process.env.NODE_ENV !== 'production') {
  const { createServer } = await import('vite');
  const viteServer = await createServer({
    server: { middlewareMode: true }
  });
  app.use(viteServer.middlewares);
} else {
  app.use(express.static(path.join(__dirname, 'dist')));
  app.get('*', (_req, res) => {
    res.sendFile(path.join(__dirname, 'dist', 'index.html'));
  });
}

const PORT = Number(process.env.PORT) || 3000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
});
