const Validator = require('validator');
const isEmpty = require("./is-empty");

module.exports = function validatePostInput(data) {
  let errors = {};

  data.text = !isEmpty(data.text) ? data.text : '';

  if(!Validator.isLength(data.text,{min:5,max:300})){
    errors.text = "文本字符不能小于5位且不能大于300位";
  }

  if(Validator.isEmpty(data.text)){
    errors.text = "文本不能为空!";
  }

  return {
    errors,
    isValid:isEmpty(errors)
  };
}