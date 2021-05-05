'use strict'

const switcher = document.querySelector('.btn');
const searcher = document.querySelector('#submit');
const typePicker = document.querySelector('#searchBy');
var input = document.getElementById('search');

var url;
const url_front = "https://www.themealdb.com/api/json/v1/1/";
var url_middle;
var url_end;

const categories_url = "https://www.themealdb.com/api/json/v1/1/list.php?c=list";
var categories = [];

var request = new XMLHttpRequest();
var categories_request = new XMLHttpRequest();

const app = document.getElementById('root')
const options = document.getElementById('options')
const container = document.getElementById('container')
const favorites = document.getElementById('favorites')

const MAX_INGREDIENTS = 20;


//retreive any persistant information
var favsInfo;
if (localStorage.getItem("favsInfo")) {
    let stringFavs = localStorage.getItem("favsInfo");
    let arrayFavs = JSON.parse(stringFavs);
    favsInfo = new Map(arrayFavs)
} else {
    favsInfo = new Map();
}

var mealCount;
if (localStorage.getItem("mealCount")) {
    let stringCount = localStorage.getItem("mealCount");
    let arrayCount = JSON.parse(stringCount);
    mealCount = new Map(arrayCount)
} else {
    mealCount = new Map();
}

categories_request.open('GET', categories_url, true);
categories_request.onload = function () {
    // get list of all categories. only get it once as we reuse it
    const categories = JSON.parse(categories_request.response).meals;
    categories.forEach((category) => {
        const c = document.createElement('button')
        c.textContent = category.strCategory
        c.setAttribute('class', 'category')
        options.appendChild(c)
    })
    //options.style.display = 'none'
    createFavorites();

    //here's the crux of the page
    function getSearch() {
        switch (typePicker.value) {
            case 'name':
                url_middle = "search.php?s=";
                break;
            case 'ingredients':
                url_middle = "filter.php?i="
                break;
            case 'category':
                url_middle = "filter.php?c="
                break;
            default:
                url_middle = "search.php?s="
        }

        //construct search based off of user
        url_end = input.value;
        document.getElementById("myText").innerHTML = "Searched for " + url_end + " by " + typePicker.value;
        if (url_end=="") {
            document.getElementById("myText").innerHTML = ""
        }
        url = url_front + url_middle + url_end;

        request.open('GET', url, true);

        //remove results of previous search
        while (container.firstChild) {
            container.removeChild(container.lastChild);
        }

        var data;
        request.onload = function () {
            // Begin accessing JSON data here
            data = JSON.parse(this.response);

            if (request.status >= 200 && request.status < 400) {
                if (data.meals != null) {
                    //if only one result, let's make it important
                    if (typePicker.value == 'name' && data.meals.length == 1) {
                        const meal = data.meals[0]
                        const card = makeRecipe(meal.strMeal, meal.strMealThumb)

                        const h3 = document.createElement('h3')
                        h3.textContent = "Ingredients"
                        h3.setAttribute('text-decoration', 'underline')

                        const ul = document.createElement('ul');
                        var ingredient = "strIngredient";
                        for (var i = 1; i <= MAX_INGREDIENTS; i++) {
                            const li = document.createElement('li');
                            if (meal[ingredient + i] && meal[ingredient + i] != "") {
                                li.textContent = meal[ingredient + i];
                                ul.appendChild(li);
                            }
                        }

                        const h3_2 = document.createElement('h3')
                        h3_2.textContent = "Directions"
                        h3_2.setAttribute('text-decoration', 'underline')

                        const p = document.createElement('p')
                        p.textContent = meal.strInstructions

                        if (mealCount.has(meal.strMeal)) {
                            mealCount.set(meal.strMeal, mealCount.get(meal.strMeal) + 1)
                        } else {
                            mealCount.set(meal.strMeal, 1)
                        }

                        const timesSearched = document.createElement('p')
                        timesSearched.textContent = "You have searched this recipe " + mealCount.get(meal.strMeal) + " time"
                        if (mealCount.get(meal.strMeal) > 1) {
                            timesSearched.textContent += "s!"
                        } else {
                            timesSearched.textContent += "!"
                        }

                        card.appendChild(h3)
                        card.appendChild(ul)
                        card.appendChild(h3_2)
                        card.appendChild(p)
                        card.appendChild(timesSearched)

                        let hover = card.querySelector('div')
                        hover.setAttribute('id', 'hoversolo');

                        container.appendChild(card)
                        console.log(card)
                    } else {
                        var counter = 0
                        var row;
                        data.meals.forEach((meal) => {
                            const card = makeRecipe(meal.strMeal, meal.strMealThumb)
                            if (counter%3==0) {
                                row = document.createElement('div')
                                container.appendChild(row)
                                row.setAttribute('class', 'row')
                            }
                            let column = document.createElement('div')
                            column.setAttribute('class', 'column')
                            row.appendChild(column)
                            column.appendChild(card)
                            counter+=1;
                        })
                    }
                } else {
                    const p = document.createElement('p')
                    p.textContent = "Hmm we don't seem to have any other that. Try something else!"
                    container.appendChild(p)
                }
            } else {
                //TODO (A)
                const errorMessage = document.createElement('marquee')
                errorMessage.textContent = "Issue receiving data from MealDB"
                app.appendChild(errorMessage)
            }
        }

        request.send();
    }

    //given name of dish and the picture source, makes a card element for the dish
    function makeRecipe(name, image) {
        const card = document.createElement('div')
        card.setAttribute('class', 'card')
        card.setAttribute('name', name)

        const h2 = document.createElement('h2')
        h2.textContent = name
        h2.setAttribute('class', 'meal');

        const img = document.createElement('img')
        img.src = image
        img.setAttribute('class', 'meal');

        const div = document.createElement('div')

        const lookUp = document.createElement('button')
        const fav = document.createElement('button')
        lookUp.setAttribute('class', 'hoverButton hoverButton-lookUp')
        fav.setAttribute('class', 'hoverButton hoverButton-fav')
        lookUp.setAttribute('name', name)
        fav.setAttribute('name', name)
        lookUp.textContent = "View this recipe"
        if (favsInfo.has(name)) {
            fav.textContent = "Unfavorite this recipe"
        } else {
            fav.textContent = "Favorite this recipe"
        }
        div.appendChild(lookUp)
        div.appendChild(fav)

        div.setAttribute('class', 'hover')
        div.setAttribute('name', name)

        card.appendChild(div)
        card.appendChild(h2)
        card.appendChild(img)

        return card
    }

    //toggles unique displays for category and favorites
    function displayOptions() {
        if (typePicker.value == 'category') {
            options.style.display = 'block'
            favorites.style.display = 'none'
            container.style.display = 'block'
            searcher.style.display = 'inline-block'
            input.style.display = 'inline-block'
        } else if (typePicker.value == 'favorite') {
            options.style.display = 'none'
            favorites.style.display = 'block'
            container.style.display = 'none'
            searcher.style.display = 'none'
            input.style.display = 'none'
            createFavorites();
        } else {
            options.style.display = 'none'
            favorites.style.display = 'none'
            container.style.display = 'block'
            searcher.style.display = 'inline-block'
            input.style.display = 'inline-block'
        }
    }

    //updates underlying page of favorites
    function createFavorites() {
        while (favorites.firstChild) {
            favorites.removeChild(favorites.lastChild);
        }

        var counter = 0
        var row;
        favsInfo.forEach((image, name) => {
            let card = makeRecipe(name, image)
            if (counter%3==0) {
                row = document.createElement('div')
                favorites.appendChild(row)
                row.setAttribute('class', 'row')
            }
            let column = document.createElement('div')
            column.setAttribute('class', 'column')
            row.appendChild(column)
            column.appendChild(card)
            counter+=1;
        });
    }

    searcher.addEventListener('click', getSearch);
    input.addEventListener('keydown', function (event) {
        if (event.keyCode === 13) {
            getSearch()
        }
    });

    typePicker.addEventListener('change', displayOptions)

    options.addEventListener("click", function (event) {
        input.value = event.target.textContent
        getSearch();
    });

    container.addEventListener("mouseover", function (event) {
        if (event.target.className === 'hover') {
            event.target.style.opacity = 0.4;
        }
    });

    container.addEventListener("mouseout", function (event) {
        var x = event.clientX, y = event.clientY,
            elementMouseIsOver = document.elementFromPoint(x, y);
        if (event.target.className === 'hover' && !elementMouseIsOver.className.includes("hoverButton")) {
            event.target.style.opacity = 0;
        }
    });

    favorites.addEventListener("mouseover", function (event) {
        if (event.target.className === 'hover') {
            event.target.style.opacity = 0.4;
        }
    });

    favorites.addEventListener("mouseout", function (event) {
        var x = event.clientX, y = event.clientY,
            elementMouseIsOver = document.elementFromPoint(x, y);
        if (event.target.className === 'hover' && !elementMouseIsOver.className.includes("hoverButton")) {
            event.target.style.opacity = 0;
        }
    });

    //this one means one of the options when hovering over a recipe was triggered
    //either a search or change to the favorites
    container.addEventListener("click", function (event) {
        if (event.target.className === 'hoverButton hoverButton-lookUp') {
            typePicker.value = 'name';
            input.value = event.target.name;
            getSearch();
        } else if (event.target.className === 'hoverButton hoverButton-fav') {
            if (favsInfo.has(event.target.name)) {
                favsInfo.delete(event.target.name)
                event.target.textContent = "Favorite this recipe"
            } else {
                let source = event.target.parentElement.parentElement
                let image = source.querySelector("img").src
                let name = source.querySelector("h2").textContent
                favsInfo.set(name, image)
                event.target.textContent = "Unfavorite this recipe"
            }
        }
    });

    favorites.addEventListener("click", function (event) {
        if (event.target.className === 'hoverButton hoverButton-lookUp') {
            input.value = event.target.name;
            typePicker.value = 'name';
            getSearch();
            displayOptions();
        } else if (event.target.className === 'hoverButton hoverButton-fav') {
            if (favsInfo.has(event.target.name)) {
                favsInfo.delete(event.target.name)
                createFavorites();
                event.target.textContent = "Favorite this recipe"
            } else {
                let source = event.target.parentElement.parentElement
                let image = source.querySelector("img").src
                let name = source.querySelector("h2").textContent
                favsInfo.set(name, image)
                createFavorites();
                event.target.textContent = "Unfavorite this recipe"
            }
        }
    });

    switcher.addEventListener('click', function () {
        document.body.classList.toggle('dark-theme')
        var className = document.body.className;
        if (className == "light-theme") {
            this.textContent = "Dark";
        }
        else {
            this.textContent = "Light";
        }
    });
    
    getSearch();
}
categories_request.send();

window.addEventListener('beforeunload', function (e) {
    localStorage.setItem("favsInfo", JSON.stringify(Array.from(favsInfo)))
    localStorage.setItem("mealCount", JSON.stringify(Array.from(mealCount)))
});