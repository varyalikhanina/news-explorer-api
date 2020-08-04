const Article = require('../models/article');
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
  const { keyword, title, text, date, source, link, image } = req.body;
  const userId = req.user._id;
  Article.create({ keyword, title, text, date, source, link, image, owner: userId })
    .then((article) => res.send({ data: article }))
    .catch((err) => {
      if (err.name === 'ValidationError') {
        next(new BadRequest('Введите имя карточки и ссылку на картинку'));
      } else {
        next(new Error('Произошла ошибка'));
      }
    });
};

const deleteArticleById = (req, res, next) => {
  Article.findById(req.params.id)
    .orFail(new NotFoundError('Такой статьи не существует'))
    .then((article) => {
      const { owner } = article;
      if (req.user._id === owner.toString()) {
        Article.findByIdAndRemove(req.params.id)
          .then(() => res.status(200).send({ message: 'Статья удалена' }));
      } else {
        throw new Forbidden('Вы не можете удалить чужую статью');
      }
    })
    .catch(next);
};

module.exports = {
  getArticles,
  createArticle,
  deleteArticleById
};