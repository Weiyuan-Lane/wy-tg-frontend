$(document).ready(function(){
  var githubResultsTable = $('#github_results_table'),
      loadingModal = $('#loading_modal');

  function showLoading(){
    loadingModal.modal({'backdrop': 'static', 'keyboard': false});
  }

  function hideLoading(){
    loadingModal.modal('hide');
  }

  function showGithubInfoModal(){
  }

  function searchGithub(str, pageNum, itemsPerPage, successCallback, failureCallback){
    $.ajax({
      type: "GET",
      url: "https://api.github.com/search/repositories",
      data: {
        q: str,
        page: pageNum,
        per_page: itemsPerPage
      },
      success: function(response){
        if (typeof(successCallback) === 'function'){
          successCallback(response.total_count, response.items);
        }
      },
      error: failureCallback
    });
  }

  function tableSearch(params) {
    var data = params.data;
    if (typeof(data.search) === 'string' && data.search !== '' ){
      var pageNum = data.offset === 0 ? 0 :
        Math.floor(data.limit / data.offset);
      searchGithub(data.search, pageNum, data.limit, function(total, rows){
        params.success({total: total, rows: rows});
      });
    }
    else {
      params.success({total: 0, rows:[]});
    }
  }

  function init(){
    githubResultsTable.bootstrapTable({
      onClickRow: function (row, $element, field) {
        console.log(row);
      },
      ajax: tableSearch,
      toggle: "table",
      sidePagination: "server",
      pagination: "true",
      search:"true",
      pageList: "[5, 10, 20, 50, 100]"
    });
  }
  init();
});
