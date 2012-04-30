// add generic "dirty flag" support to knockout.js
ko.dirtyFlag = function(root, isInitiallyDirty) {
    var result = function() {},
        _initialState = ko.observable(ko.toJSON(root)),
        _isInitiallyDirty = ko.observable(isInitiallyDirty);

    result.isDirty = ko.dependentObservable(function() {
        return _isInitiallyDirty() || _initialState() !== ko.toJSON(root);
    });

    result.reset = function() {
        _initialState(ko.toJSON(root));
        _isInitiallyDirty(false);
    };

    return result;
};

// identify user
$.getJSON("http://simpleidentity.aws.af.cm/?callback=?", bindModel);

function bindModel(userId) {


    // knockout class bindings
    function Task(data) {
        this.title = ko.observable(data.title);
        this.isDone = ko.observable(data.isDone);
        this.dirtyFlag = new ko.dirtyFlag(this);
    }

    function TaskListViewModel() {
        // Data
        var self = this;
        self.tasks = ko.observableArray([]);
        self.newTaskText = ko.observable();
        self.incompleteTasks = ko.computed(function() {
            return ko.utils.arrayFilter(self.tasks(), function(task) { return !task.isDone() && !task._destroy });
        });

        // Operations
        self.addTask = function() {
            self.tasks.push(new Task({ title: this.newTaskText() }));
            self.newTaskText("");
            self.save();
        };
        self.removeTask = function(task) { self.tasks.destroy(task); 
            self.save();
            self.tasks.remove(task);
            };
        
        // Load initial state from server, convert it to Task instances, then populate self.tasks
        $.getJSON("/tasks/" + userId, function(allData) {
            var mappedTasks = $.map(allData, function(item) { return new Task(item) });
            self.tasks(mappedTasks);
        });
        
        self.save = function() {
            $.ajax("/tasks/" + userId, {
                data: ko.toJSON({ tasks: self.tasks }),
                type: "post", contentType: "application/json"
            });
        };

        self.dirtyItems = ko.dependentObservable(function() {
            return ko.utils.arrayFilter(this.tasks(), function(item) {
                return item.dirtyFlag.isDirty();
            });
        }, self);

        self.isDirty = ko.dependentObservable(function() {

            var isDirty = this.dirtyItems().length > 0;
            if(isDirty) {
                this.save();
            }
            return isDirty;
        }, self);

    }
    
    ko.applyBindings(new TaskListViewModel());
}