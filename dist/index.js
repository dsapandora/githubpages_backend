"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const axios_1 = __importDefault(require("axios"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const app = (0, express_1.default)();
const port = process.env.PORT || 5000;
app.use((0, cors_1.default)());
app.use(express_1.default.json());
app.get('/pinned-repos/', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
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
        const response = yield axios_1.default.post('https://api.github.com/graphql', { query }, {
            headers: {
                Authorization: `Bearer ${process.env.GITHUB_TOKEN}`,
                'Content-Type': 'application/json',
            },
        });
        res.json(response.data);
    }
    catch (error) {
        if (axios_1.default.isAxiosError(error)) {
            // This type check ensures that the error is an AxiosError and has response properties
            res.status(500).json({ error: error.message });
        }
        else {
            // For other types of errors, provide a generic error message
            res.status(500).json({ error: 'An unexpected error occurred' });
        }
    }
}));
app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
