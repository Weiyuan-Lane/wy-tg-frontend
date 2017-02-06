/**
 * This script allows for the implementation of a simple search interface for
 * github's api. The features are implemented on the view - index.html, located
 * in the same directory, and are as follows:
 *
 * - Provide a search interface that accepts keywords, and then displaying the
 *   owner and repository names of the results retrieved
 * - Upon clicking on a single row of the repository search results, additional
 *   information on the repository - Url, followers, description and language
 *   will be displayed
 *
 * Author: Weiyuan Liu
 */
$(document).ready(function(){
  var githubResultsTable = $('#github_results_table'),
      loadingModal = $('#loading_modal'),
      githubInfoModal = $('#github_info_modal');

  //Set default settings for bootstrap-table lib
  var bootstrapTableSettings = {
    /* Event is triggered when a  single row is clicked on bootstrap-table
     * In this implementation, the information modal is loaded and displayed,
     * after the followers' information has been successfully retrieved
     *
     * @param githubInfo The json information corresponding to the clicked row
     */
    onClickRow: function(githubInfo){
      showLoading();
      $.ajax({
        type: "GET",
        url: githubInfo.subscribers_url,
        success: function(response){
          showGithubRepositoryInfo(githubInfo.description, githubInfo.language,
             githubInfo.html_url, response);
          hideLoading();
        },
        error: notifyAjaxError
      });
    },
    /* Event is triggered whenever an ajax call is desired by bootstrap-table
     * This method checks for the relevant information in params and submit a
     * GET request to github's API to retrieve the repositories' information.
     * The information is then supplied to bootstrap-table for displaying
     *
     * @param params Information gathered by the lib's interface
     */
    ajax: function(params) {
      var data = params.data;
      //Search only when keyword is not null or empty
      if (typeof(data.search) === 'string' && data.search !== '' ){
        var pageNum = Math.floor(data.offset / data.limit) + 1;
        searchGithubRepo(data.search, pageNum, data.limit, function(total, rows){
          params.success({total: total, rows: rows});
        }, function (jqXHR, textStatus, errorThrown){
          params.success({total: 0, rows:[]});
          githubResultsTable.bootstrapTable('resetSearch');
          notifyAjaxError(jqXHR, textStatus, errorThrown);
        });
      }
      else {
        params.success({total: 0, rows:[]});
      }
    },
    toggle: "table",
    sidePagination: "server",
    pagination: "true",
    search:"true",
    pageList: "[5, 10, 20, 50, 100]"
  };

  /* Function to search for github's repositories, given the query information
   *
   * @param str String keyword to search
   * @param pageNum The page number offset to search for the results
   * @param itemsPerPage Limit on repositories amount queried
   * @param successCallback Callback if request is successfully executed
   * @param failureCallback Callback if request fails to execute
   */
  function searchGithubRepo(str, pageNum, itemsPerPage, successCallback, failureCallback){
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
          //Only top 1000 entries can be queried (limitation by github apu)
          var totalCount = response.total_count > 1000 ? 1000 : response.total_count;
          successCallback(totalCount, response.items);
        }
      },
      error: failureCallback
    });
  }

  // Function to show that a loading process is ongoing
  function showLoading(){
    loadingModal.modal({'backdrop': 'static', 'keyboard': false});
  }

  // Function to hide the loading modal, showing that loading has ended
  function hideLoading(){
    loadingModal.modal('hide');
  }

  /* Function to display github repository information for a single row
   *
   * @param description Description set for the targetted repository
   * @param language The selected language for the repository
   * @param url The http url for the repository
   * @param followers Array of followers for the repository
   */
  function showGithubRepositoryInfo (description, language, url, followers){
    $('#github_info_modal_description').html(description || '-');
    $('#github_info_modal_language').html(language || '-');
    $('#github_info_modal_url').attr('href', url);
    $('#github_info_modal_url').html(url);
    $('#github_info_modal_followers').html(createFollowerLabels(followers));
    githubInfoModal.modal('show');
  }

  /* Function notifies of any ajax errors encountered
   *
   * @param jqXHR jqXHR object
   * @param textStatus Error thrown text message
   * @param errorThrown Type of error thrown
   */
  function notifyAjaxError(jqXHR, textStatus, errorThrown){
    if (jqXHR.responseJSON && jqXHR.responseJSON.message){
      alert(jqXHR.responseJSON.message);
    }
    else if (jqXHR.responseText){
      alert(jqXHR.responseText);
    }
    else if (textStatus){
      alert('Encountered Error: ' + textStatus);
    }
    else {
      alert('Encountered Error');
    }
  }

  /* Function to create the string representation of a primary label in
   * bootstrap
   *
   * @param text Text to be displayed within the label
   * @param link Link to be associated to the label
   * @return String for the respresentation of the html element
   */
  function createHtmlPrimaryLabelText(text, link){
    return "<a href='"+link+"' target='_blank' class='no-text-decoration'>\
              <span class='label label-primary'>"+text+"</span>\
            </a>";
  }

  /* Function to create the string representation of all the labels for linking
   * and displaying the followers' name
   *
   * @param followers Followers array of JSON objects, retrieved from github api
   *                  GET reqest on a repository's followers
   * @return The consolidated string representation of all label elements
   */
  function createFollowerLabels(followers){
    var labels = [], labelsDom;
    for (var i = 0; i < followers.length; i++){
      labels.push(createHtmlPrimaryLabelText(followers[i].login, followers[i].html_url));
    }
    labelsDom = labels.join(' ');
    return labelsDom;
  }

  //Base initialiser function
  function init(){
    githubResultsTable.bootstrapTable(bootstrapTableSettings);
  }
  init();
});
