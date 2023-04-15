"use strict";

// This is the global list of the stories, an instance of StoryList
let allStoryList;
let currentStoryDisplay;

/** Get and show stories when site first loads. */

async function getAndShowStoriesOnStart() {
  allStoryList = await StoryList.getStories();
  $storiesLoadingMsg.remove();

  putStoriesOnPage(allStoryList);
  currentStoryDisplay = "allStoryList";
}

/**
 * A render method to render HTML for an individual Story instance
 * - story: an instance of Story
 *
 * Returns the markup for the story.
 */

function generateStoryMarkup(story, favoriteStatus, loggedIn) {
  // console.debug("generateStoryMarkup", story);

  const hostName = story.getHostName();
  let favoriteStarStatus = favoriteStatus ? "fa-solid" : "fa-regular";
  let hiddenStatus = loggedIn ? "" : "hidden";
  return $(`
      <li id="${story.storyId}">
        <i class="${favoriteStarStatus} fa-star favorite-star ${hiddenStatus} icon-btn"></i>
        <div class="story-details"><a href="${story.url}" target="a_blank" class="story-link">
          ${story.title}
        </a>
        <small class="story-hostname">(${hostName})</small>
        <small class="story-author">by ${story.author}</small>
        <small class="story-user">posted by ${story.username}</small></div>
        <i class="fa-solid fa-trash delete-btn icon-btn ${hiddenStatus}"></i>
      </li>
    `);
}

/** Gets list of stories from server, generates their HTML, and puts on page. */

function putStoriesOnPage(storyList) {
  console.debug("putStoriesOnPage");
  console.debug(storyList);
  $allStoriesList.empty();

  // loop through all of our stories and generate HTML for them
  for (let story of storyList.stories) {
    //if user is logged in then check if story in favorites
    //else return false for favoriteStatus
    let favoriteStatus = false;
    let loggedIn = false;
    if (currentUser !== undefined) {
      loggedIn = true;
      for (let favoriteStory of currentUser.favorites) { 
        if (story.storyId === favoriteStory.storyId) {
          favoriteStatus = true;
          break;
        }
      }
    }
    const $story = generateStoryMarkup(story, favoriteStatus, loggedIn);
    $allStoriesList.append($story);

  }
  $allFavoriteStars = $(".favorite-star");
  $allFavoriteStars.on("click", toggleFavorite);
  $allDeleteBtns = $(".delete-btn");
  $allDeleteBtns.on("click", deleteStory);
  $allStoriesList.show();
}

async function submitStory(evt) {
  console.debug("submitStory");
  evt.preventDefault();
  const title = $("#story-title").val();
  const author = $("#story-author").val();
  const url = $("#story-url").val();
  if (title === "" ) {
    alert("Enter a title!");
    return;
  } else if (author === "") {
    alert("Enter an author!");
    return;
  } else if (url === "") {
    alert("Enter a url!");
    return;
  }
  
  await allStoryList.addStory(currentUser, {title, author, url});
  await currentUser.updateOwnStories();
  $("#story-title").val("");
  $("#story-author").val("");
  $("#story-url").val("");
  hidePageComponents();
  await getAndShowStoriesOnStart();

}

$storySubmitForm.on("submit", submitStory);

async function toggleFavorite(evt) {
  console.debug("toggleFavorite");
  let parentLi = evt.target.parentElement;
  let storyId = parentLi.id;
  if (evt.target.classList.contains("fa-solid")) {
    //remove from favorites
    console.debug("unfavoriting");
    await currentUser.deleteFavoriteStory(storyId);
    console.debug(currentUser.favorites);
    
  } else if (evt.target.classList.contains("fa-regular")) {
    //add to favorites
    console.debug("favoriting");
    let newFavStory = await Story.getStory(storyId);
    await currentUser.addFavoriteStory(newFavStory);
    console.debug(currentUser.favorites);
  }

  //update display
  if (currentStoryDisplay === "allStoryList") {
    putStoriesOnPage(allStoryList);
  } else if (currentStoryDisplay === "favoriteStoryList") {
    let favoritesStoryList = StoryList.makeStoryListFromList(currentUser.favorites);
    putStoriesOnPage(favoritesStoryList);
  } else if (currentStoryDisplay === "myStoryList") {
    let myStoriesStoryList = StoryList.makeStoryListFromList(currentUser.ownStories);
    putStoriesOnPage(myStoriesStoryList);
  }
}

async function deleteStory(evt) {
  console.debug("deleteStory");
  let parentLi = evt.target.parentElement;
  let storyId = parentLi.id;  
  let storyRemoved = await allStoryList.deleteStoryfromStoryList(currentUser, storyId);
  if (storyRemoved) {
    currentUser.removeFromFavorites(storyId);
    await currentUser.updateOwnStories();

    if (currentStoryDisplay === "allStoryList") {
      putStoriesOnPage(allStoryList);
    } else if (currentStoryDisplay === "favoriteStoryList") {
      let favoritesStoryList = StoryList.makeStoryListFromList(currentUser.favorites);
      putStoriesOnPage(favoritesStoryList);
    } else if (currentStoryDisplay === "myStoryList") {
      let myStoriesStoryList = StoryList.makeStoryListFromList(currentUser.ownStories);
      putStoriesOnPage(myStoriesStoryList);
    }
  }
}