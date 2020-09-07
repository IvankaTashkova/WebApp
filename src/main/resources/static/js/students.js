angular.module('students', ['ngResource', 'ui.bootstrap']).
    factory('Students', function ($resource) {
        return $resource('students');
    }).
    factory('Student', function ($resource) {
        return $resource('students/:id', {id: '@id'});
    }).
    factory("EditorStatus", function () {
        var editorEnabled = {};

        var enable = function (id, fieldName) {
            editorEnabled = { 'id': id, 'fieldName': fieldName };
        };

        var disable = function () {
            editorEnabled = {};
        };

        var isEnabled = function(id, fieldName) {
            return (editorEnabled['id'] == id && editorEnabled['fieldName'] == fieldName);
        };

        return {
            isEnabled: isEnabled,
            enable: enable,
            disable: disable
        }
    });

function StudentsController($scope, $modal, Students, Student, Status) {
    function list() {
        $scope.students = Students.query();
    }

    function clone (obj) {
        return JSON.parse(JSON.stringify(obj));
    }

    function saveStudent(student) {
        Students.save(student,
            function () {
                Status.success("Student saved");
                list();
            },
            function (result) {
                Status.error("Error saving student: " + result.status);
            }
        );
    }

    $scope.addStudent = function () {
        var addModal = $modal.open({
            templateUrl: 'templates/studentForm.html',
            controller: StudentModalController,
            resolve: {
                student: function () {
                    return {};
                },
                action: function() {
                    return 'add';
                }
            }
        });

        addModal.result.then(function (student) {
            saveStudent(student);
        });
    };

    $scope.updateStudent = function (student) {
        var updateModal = $modal.open({
            templateUrl: 'templates/studentForm.html',
            controller: StudentModalController,
            resolve: {
                student: function() {
                    return clone(student);
                },
                action: function() {
                    return 'update';
                }
            }
        });

        updateModal.result.then(function (student) {
            saveStudent(student);
        });
    };

    $scope.deleteStudent = function (student) {
        Student.delete({id: student.id},
            function () {
                Status.success("Student deleted");
                list();
            },
            function (result) {
                Status.error("Error deleting student: " + result.status);
            }
        );
    };

    $scope.setStudentsView = function (viewName) {
        $scope.studentsView = "templates/" + viewName + ".html";
    };

    $scope.init = function() {
        list();
        $scope.setStudentsView("list");
        $scope.sortField = "name";
        $scope.sortDescending = false;
    };
}

function StudentModalController($scope, $modalInstance, student, action) {
    $scope.studentAction = action;
    $scope.facultyNumberPattern = /^[0-9]{10}$/;
    $scope.student = student;

    $scope.ok = function () {
        $modalInstance.close($scope.student);
    };

    $scope.cancel = function () {
        $modalInstance.dismiss('cancel');
    };
};

function StudentEditorController($scope, Students, Status, EditorStatus) {
    $scope.enableEditor = function (student, fieldName) {
        $scope.newFieldValue = student[fieldName];
        EditorStatus.enable(student.id, fieldName);
    };

    $scope.disableEditor = function () {
        EditorStatus.disable();
    };

    $scope.isEditorEnabled = function (student, fieldName) {
        return EditorStatus.isEnabled(student.id, fieldName);
    };

    $scope.save = function (student, fieldName) {
        if ($scope.newFieldValue === "") {
            return false;
        }

        student[fieldName] = $scope.newFieldValue;

        Students.save({}, student,
            function () {
                Status.success("Student saved");
                list();
            },
            function (result) {
                Status.error("Error saving student: " + result.status);
            }
        );

        $scope.disableEditor();
    };

    $scope.disableEditor();
}

angular.module('students').
    directive('inPlaceEdit', function () {
        return {
            restrict: 'E',
            transclude: true,
            replace: true,

            scope: {
                ipeFieldName: '@fieldName',
                ipeInputType: '@inputType',
                ipeInputClass: '@inputClass',
                ipePattern: '@pattern',
                ipeModel: '=model'
            },

            template:
                '<div>' +
                    '<span ng-hide="isEditorEnabled(ipeModel, ipeFieldName)" ng-click="enableEditor(ipeModel, ipeFieldName)">' +
                        '<span ng-transclude></span>' +
                    '</span>' +
                    '<span ng-show="isEditorEnabled(ipeModel, ipeFieldName)">' +
                        '<div class="input-append">' +
                            '<input type="{{ipeInputType}}" name="{{ipeFieldName}}" class="{{ipeInputClass}}" ' +
                                'ng-required ng-pattern="{{ipePattern}}" ng-model="newFieldValue" ' +
                                'ui-keyup="{enter: \'save(ipeModel, ipeFieldName)\', esc: \'disableEditor()\'}"/>' +
                            '<div class="btn-group btn-group-xs" role="toolbar">' +
                                '<button ng-click="save(ipeModel, ipeFieldName)" type="button" class="btn"><span class="glyphicon glyphicon-ok"></span></button>' +
                                '<button ng-click="disableEditor()" type="button" class="btn"><span class="glyphicon glyphicon-remove"></span></button>' +
                            '</div>' +
                        '</div>' +
                    '</span>' +
                '</div>',

            controller: 'StudentEditorController'
        };
    });
