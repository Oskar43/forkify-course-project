import * as model from './model.js';
import { MODAL_CLOSE_SEC } from './config.js';
import recipeView from './views/recipeView.js';
import searchView from './views/searchView.js';
import resultsView from './views/resultsView.js';
import pageNavView from './views/pageNavView.js';
import bookmarksView from './views/bookmarksView.js';
import addRecipeView from './views/addRecipeView.js';

import '../sass/main.scss';
import 'core-js/stable';
import 'regenerator-runtime/runtime';

// if (model.hot) {
//   model.hot.accept();
// }

const controlRecipes = async function () {
  try {
    const id = window.location.hash.slice(1);

    if (!id) return;
    recipeView.renderSpinner();

    //0) Update results view to mark selected search result
    resultsView.update(model.getSerchResultsPage());
    bookmarksView.update(model.state.bookmarked);

    // 1) Loading Recipe
    await model.loadRecipe(id);

    // 2) Rendering Recipe
    recipeView.render(model.state.recipe);
  } catch (err) {
    recipeView.renderError();
  }
};

const controlSearchResults = async function () {
  try {
    resultsView.renderSpinner();

    //1) Get Search query
    const query = searchView.getQuery();
    if (!query) return;

    //2) Load search results
    await model.loadSearchResults(query);

    //3) Render results
    resultsView.render(model.getSerchResultsPage());

    //4) Render initial pageNav btn
    pageNavView.render(model.state.search);
  } catch (err) {
    console.log(err);
  }
};

const controlPageNav = function (goToPage) {
  //1) Render New results
  resultsView.render(model.getSerchResultsPage(goToPage));

  //2) Render initial pageNav btn
  pageNavView.render(model.state.search);
};

const controlServings = function (newServings) {
  // Updata the recipe servings (in state)
  model.updateSevings(newServings);

  // Updata the recipe view
  recipeView.update(model.state.recipe);
};

const controlAddBookmark = function () {
  //1) Add/Remove Bookmark
  if (!model.state.recipe.bookmarked) model.addBookmark(model.state.recipe);
  else model.deleteBookmark(model.state.recipe.id);

  //2) Update recipe view
  recipeView.update(model.state.recipe);

  //3)Render Bookmarks
  bookmarksView.render(model.state.bookmarked);
};

const controlBookmarks = function () {
  bookmarksView.render(model.state.bookmarked);
};

const controlAddRecipe = async function (newRecipe) {
  try {
    // Show loading spinner
    addRecipeView.renderSpinner();

    //Upload the new Rcipe
    await model.uploadRecipe(newRecipe);
    console.log(model.state.recipe);

    // Render Recipe
    recipeView.render(model.state.recipe);

    // Success message
    addRecipeView.renderMessage();

    // Render bookmark
    bookmarksView.render(model.state.bookmarked);

    // Change Id in URL
    window.history.pushState(null, '', `#${model.state.recipe.id}`);

    // Close form window
    setTimeout(function () {
      addRecipeView.toggleWindow();
    }, MODAL_CLOSE_SEC * 1000);
  } catch (err) {
    console.error(err);
    addRecipeView.renderError(err.message);
  }
};

const init = function () {
  bookmarksView.addHandlerRander(controlBookmarks);
  recipeView.addHandlerRender(controlRecipes);
  recipeView.addHandlerUpdateServings(controlServings);
  recipeView.addHandlerAddBookmark(controlAddBookmark);
  searchView.addHandelerSerach(controlSearchResults);
  pageNavView.addHandlerClick(controlPageNav);
  addRecipeView.addHandlerUpload(controlAddRecipe);
};
init();
