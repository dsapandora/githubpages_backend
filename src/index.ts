import express, { Request, Response } from 'express';
import axios from 'axios';
import cors from 'cors';
import dotenv from 'dotenv';
import sgMail from '@sendgrid/mail';
import bodyParser from 'body-parser';

dotenv.config();

const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

sgMail.setApiKey(process.env.SENDGRID_API_KEY!);

app.get('/pinned-repos/', async (req: Request, res: Response) => {
    const query = `
    {
      user(login: "${process.env.USER_NAME}") {
        pinnedItems(first: 6, types: REPOSITORY) {
          totalCount
          edges {
            node {
              ... on Repository {
                name
                description
                url
                openGraphImageUrl
              }
            }
          }
        }
      }
    }
    `;

    try {
        const response = await axios.post(
            'https://api.github.com/graphql',
            { query },
            {
                headers: {
                    Authorization: `Bearer ${process.env.GITHUB_TOKEN}`,
                    'Content-Type': 'application/json',
                },
            }
        );
        res.json(response.data);
    } catch (error) {
        if (axios.isAxiosError(error)) {
            res.status(500).json({ error: error.message });
        } else {
            res.status(500).json({ error: 'An unexpected error occurred' });
        }
    }
});

// New endpoint to handle email sending with SendGrid
app.post('/api/send-email', async (req: Request, res: Response) => {
    const { name, email, subject, message } = req.body;

    const msg = {
        to: "${process.env.USER_EMAIL}", 
        from: 'no-reply@lazyracoon.tech', 
        subject: subject,
        text: message,
        html: `<p><strong>Name:</strong> ${name}</p>
               <p><strong>Email:</strong> ${email}</p>
               <p><strong>Message:</strong> ${message}</p>`,
    };

    try {
        await sgMail.send(msg);
        res.status(200).json({ success: true, message: 'Email sent successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Failed to send email' });
    }
});

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
