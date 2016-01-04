AutoForm.addInputType("radio-with-text-input", {
    template: "afFieldRadioWithTextInput",
    valueOut: function(){
        console.log("from the custom template this ; ");
        console.log(this);
        return "some string";
    },

    valueIn: function(val){

        return val;
    },
    contextAdjust: function(context){

        console.log(" ---- context");
        console.log(context);
        return context;
    }
});

Template.quizContent.created = function(){
    this.addQuestionButtonDisabled = new ReactiveVar(true);
    this.quizQuestions = new ReactiveVar([]);
    this.quizValidator = new ReactiveVar({});
};

AutoForm.debug();

Template.quizContent.helpers({
    currentQuiz: function(){
        return Template.currentData().activeQuiz;
    },

    questionTypes: function(){
        console.log("question types : " + QuizOptions.QUESTION_TYPES)
        return QuizOptions.QUESTION_TYPES;
    },

    currentQuestionToBuild:function(){
        return Session.get("currentQuestionToBuild");
    },

    isMultipleAnswer: function(){

        var editedQuestion = Session.get("currentQuestionToBuild");
        if (editedQuestion)
        {
            return editedQuestion.questionType == QuizOptions.MULTIPLE_CHOICE_MULTIPLE_ANSWERS;
        }
        return false;

    },
    isSingleAnswer: function(){
        var editedQuestion = Session.get("currentQuestionToBuild");
        if (editedQuestion)
        {
            return editedQuestion.questionType == QuizOptions.MULTIPLE_CHOICE_SINGLE_ANSWER;
        }
        return false;
    },
    isTrueOrFalse: function(){

        var editedQuestion = Session.get("currentQuestionToBuild");
        if (editedQuestion)
        {
            return editedQuestion.questionType == QuizOptions.TRUE_OR_FALSE;;
        }
        return false;
    },

    selectedQuestionType: function(){
        var editedQuestion = Session.get("currentQuestionToBuild");
        if (editedQuestion)
        {
            return editedQuestion.questionType;
        }
    },

    quizId: function(){
        var editedQuestion = Session.get("currentQuestionToBuild");
        if (editedQuestion)
        {
            return editedQuestion.quizId
        }
        return null;
    },
    questionId: function(){
        var editedQuestion = Session.get("currentQuestionToBuild");
        if (editedQuestion)
        {
            return editedQuestion.id;
        }
        return null;
    },

    qType: function(){
        var editedQuestion = Session.get("currentQuestionToBuild");
        if (editedQuestion)
        {
            return editedQuestion.questionType;
        }
        return null;
    },

    selectDropdownOptions: function(){
        return [
            {label: "2 choices", value: 2},
            {label: "3 choices", value: 3},
            {label: "4 choices", value: 4},
            {label: "5 choices", value: 5},
            {label: "6 choices", value: 6},
            {label: "7 choices", value: 7},
            {label: "8 choices", value: 8}
        ]
    },
    numOfChoices: function() {
        var formId = AutoForm.getFormId();
        var selection = AutoForm.getFieldValue("numberOfOptions", formId);
        var selectionDropDown = $('.js-number-of-options');
        var numOfOptions = parseInt(selectionDropDown.val());

        var editedQuestion = Session.get("currentQuestionToBuild");
        var existingOptions = [];
        if (editedQuestion && editedQuestion.optionTitles){
            existingOptions = editedQuestion.optionTitles;
        }

        if(existingOptions && existingOptions.length == numOfOptions){
            //the number of options hasn't changed
            return existingOptions;
        }

        if (existingOptions){
            numOfOptions = Math.max(numOfOptions, existingOptions.length);
        }

        var optionsArray;
        if (numOfOptions > 0){
            optionsArray = [];

            for (var i=0; i < numOfOptions; i++){
                var option;
                if(existingOptions && existingOptions.length > i){
                   option = existingOptions[i];
                }else{
                    option = {
                        "title": "",
                        "isSelected": false,
                        "index": i
                    }
                }
                optionsArray.push(option);
            }

            var editedQuestion = Session.get("currentQuestionToBuild");
            editedQuestion.optionTitles = optionsArray;
            Session.set("currentQuestionToBuild", editedQuestion);
        }

        return optionsArray;
    },

});

Template.quizContent.events({
    'change #questionTypesSelector': function(event){
        Template.instance().addQuestionButtonDisabled.set(false);
        var activeQuiz = Template.currentData().activeQuiz;
        var question = new Object();// new QuizQuestion();
        question.quizId = activeQuiz._id;
        question.id = Random.id(); //assign an id to the question - need this for checking and validating answers
        question.questionType = $('#questionTypesSelector').val();
        question.description = "";
        question.title = "";
        question.options = [];
        $('#questionTypesSelector :first-child').prop('selected', true);

        Session.set("currentQuestionToBuild", question);
    },

    'change .js-number-of-options': function(event){

    },

    'click .submit-quiz-btn': function(event){

        var isPreview = Blaze._globalHelpers['isEditingCurrentCourse']() == false;
        var activeQuiz = Template.currentData().activeQuiz;
        var questions = activeQuiz.questions;

        if (!isPreview){ //edit mode
            var activeQuiz = Template.currentData().activeQuiz;
            var questions = activeQuiz.questions;
            //mark the questions as saved
            for (var q in questions ){
                var question = questions[q];
                //question.saved = true;
            }

            if (questions != undefined){

                var quizToUpdate = Quizzes.findOne({_id: activeQuiz._id});
                Quizzes.update(activeQuiz._id, {$set: {'questions': questions}})
            }

        }
        else{ // preview/exam mode
            for(var question in questions){
                //console.log("answered : " + question.answered);
            }
            console.log(" should submit the quiz")
        }

    },

    'deleteQuestion .question-content': function(event){

        //set the reactive var to update the list of questions
        Template.instance().quizQuestions.set(Template.currentData().activeQuiz.questions);
    }

});