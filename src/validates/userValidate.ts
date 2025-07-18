import Joi from 'joi';
export const signupValidate = Joi.object({
  username: Joi.string().required().messages({
    'string.base': '使用者姓名的類型應為字串',
    'string.empty': '使用者姓名不能為空',
  }),
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
});
