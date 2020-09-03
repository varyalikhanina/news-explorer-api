const Article = require('../models/article');
const { MESSAGES } = require('../utils/messages');

const BadRequest = require('../errors/bad-request');
const NotFoundError = require('../errors/not-found');
const Forbidden = require('../errors/forbidden');

const getArticles = (req, res, next) => {
  Article.find({})
    .populate('user')
    .then((article) => res.send({ data: article }))
    .catch(next);
};

const createArticle = (req, res, next) => {
  const {
    keyword, title, text, date, source, link, image,
  } = req.body;
  const userId = req.user._id;
  Article.create({
    keyword, title, text, date, source, link, image, owner: userId,
  })
    .then((article) => res.send({ data: article }))
    .catch((err) => {
      if (err.name === 'ValidationError') {
        next(new BadRequest(MESSAGES.articleValuesMissing));
      } else {
        next(new Error(MESSAGES.serverError));
      }
    });
};

const deleteArticleById = (req, res, next) => {
  Article.findById(req.params.id)
    .orFail(new NotFoundError(MESSAGES.articleNotFound))
    .then((article) => {
      const { owner } = article;
      if (req.user._id === owner.toString()) {
        Article.deleteOne(article)
          .then(() => res.status(200).send({ message: MESSAGES.articleDeleted }));
      } else {
        throw new Forbidden(MESSAGES.articleForbidden);
      }
    })
    .catch(next);
};

module.exports = {
  getArticles,
  createArticle,
  deleteArticleById,
};
