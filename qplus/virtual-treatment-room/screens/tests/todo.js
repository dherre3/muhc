angular.module('todoApp', [])
  .controller('TodoListController', function() {
    var thisController = this;
    thisController.todos = [
      {text:'learn angular', done:false},
      {text:'build an angular app', done:false}];
 
    thisController.addTodo = function() {
      thisController.todos.push({text:thisController.todoText, done:false});
      thisController.todoText = '';
    };
 
    thisController.remaining = function() {
      var count = 0;
      angular.forEach(thisController.todos, function(todo) {
        count += todo.done ? 0 : 1;
      });
      return count;
    };
 
    thisController.archive = function() {
      var oldTodos = thisController.todos;
      thisController.todos = [];
      angular.forEach(oldTodos, function(todo) {
        if (!todo.done) thisController.todos.push(todo);
      });
    };
  });
