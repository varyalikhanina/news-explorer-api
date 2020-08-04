const articleRouter = require('express').Router();
const {
  getArticles,
  createArticle,
  deleteArticleById
} = require('../controllers/articles');

articleRouter.get('/articles', getArticles);
articleRouter.post('/articles', createArticle);
articleRouter.delete('/articles', deleteArticleById);

module.exports = articleRouter;