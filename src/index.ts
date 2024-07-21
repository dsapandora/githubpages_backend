import express, { Request, Response } from 'express';
import axios from 'axios';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

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
            // This type check ensures that the error is an AxiosError and has response properties
            res.status(500).json({ error: error.message });
        } else {
            // For other types of errors, provide a generic error message
            res.status(500).json({ error: 'An unexpected error occurred' });
        }
    }
});

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
