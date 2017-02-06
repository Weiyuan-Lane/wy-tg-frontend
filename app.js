$(document).ready(function(){
  var githubResultsTable = $('#github_results_table'),
      loadingModal = $('#loading_modal'),
      githubInfoModal = $('#github_info_modal');

  function showLoading(){
    loadingModal.modal({'backdrop': 'static', 'keyboard': false});
  }

  function hideLoading(){
    loadingModal.modal('hide');
  }

  function createHtmlPrimaryLabelText(text, link){
    return "<a href='"+link+"' target='_blank' class='no-text-decoration'>\
              <span class='label label-primary'>"+text+"</span>\
            </a>";
  }

  function createFollowersLabels(followers){
    var labels = [], labelsDom;
    for (var i = 0; i < followers.length; i++){
      labels.push(createHtmlPrimaryLabelText(followers[i].login, followers[i].html_url));
    }
    labelsDom = labels.join(' ');
    return labelsDom;
  }

  function showGithubInfoModal(githubInfo){
    showLoading();
    $.ajax({
      type: "GET",
      url: githubInfo.subscribers_url,
      success: function(response){
        console.log(response);
        $('#github_info_modal_description').html(githubInfo.description || '-');
        $('#github_info_modal_language').html(githubInfo.language || '-');
        $('#github_info_modal_url').attr('href', githubInfo.html_url);
        $('#github_info_modal_url').html(githubInfo.html_url);
        $('#github_info_modal_followers').html(createFollowersLabels(response));
        hideLoading();
        githubInfoModal.modal('show');
      }
    });
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
      onClickRow: showGithubInfoModal,
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
