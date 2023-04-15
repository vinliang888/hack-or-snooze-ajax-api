"use strict";

/******************************************************************************
 * Handling navbar clicks and updating navbar
 */

/** Show main list of all stories when click site name */

function navAllStories(evt) {
  console.debug("navAllStories", evt);
  hidePageComponents();
  putStoriesOnPage(allStoryList);
  currentStoryDisplay = "allStoryList";
}

$body.on("click", "#nav-all", navAllStories);

/** Show login/signup on click on "login" */

function navLoginClick(evt) {
  console.debug("navLoginClick", evt);
  hidePageComponents();
  $loginForm.show();
  $signupForm.show();
}

$navLogin.on("click", navLoginClick);

/** When a user first logins in, update the navbar to reflect that. */

function updateNavOnLogin() {
  console.debug("updateNavOnLogin");
  $(".main-nav-links").show();
  $navLogin.hide();
  $navLogOut.show();
  $navUserProfile.text(`${currentUser.username}`).show();
}

function navSubmitClick(evt) {
  console.debug("navSubmitClick", evt);
  hidePageComponents();
  $storySubmitForm.show();
}
$navSubmit.on("click", navSubmitClick);

function navFavoritesClick(evt) {
  console.debug("navFavoritesClick", evt);
  hidePageComponents();
  let favoritesStoryList = StoryList.makeStoryListFromList(currentUser.favorites);
  putStoriesOnPage(favoritesStoryList);
  currentStoryDisplay = "favoriteStoryList";
}
$navFavorites.on("click", navFavoritesClick);

function navMyStoriesClick(evt) {
  console.debug("navMyStoriesClick", evt);

  if (currentUser.ownStories.length > 0) {
    hidePageComponents();
    let myStoriesStoryList = StoryList.makeStoryListFromList(currentUser.ownStories);
    putStoriesOnPage(myStoriesStoryList);
    currentStoryDisplay = "myStoryList";
  } else {
    alert("No stories to load!");
  }
}
$navMyStories.on("click", navMyStoriesClick);