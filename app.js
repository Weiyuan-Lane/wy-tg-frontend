$(document).ready(function(){
  var githubResultsTable = $('#github_results_table'),
      loadingModal = $('#loading_modal');


  function init(){
    githubResultsTable.bootstrapTable({
      onClickRow: function (row, $element, field) {
      }
    });
  }

  function showLoading(){
    loadingModal.modal({'backdrop': 'static', 'keyboard': false});
  }

  function hideLoading(){
    loadingModal.modal('hide');
  }

  function showGithubInfoModal(){
  }

  function searchGithub(str, successCallback, failureCallback){
    $.ajax({
      type: "GET",
      url: "https://api.github.com/search/repositories",
      data: {
        q: str
      },
      success: successCallback,
      error: failureCallback
    });
  }

  init();
});
