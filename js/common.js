"use strict";

function Component(obj) {
    for (var prop in obj) {
        if (obj.hasOwnProperty(prop)) {
            this[prop] = obj[prop];
        }
    }

    this._order = 0;
}

Component.prototype.setView = function (view, data) {
    this.htmlView = view;
    if (data) {
        this.data = data;
    }
};

Component.prototype.setOrder = function (order) {
    if (typeof order === "number" || (typeof order === "string" && +order)) {
        this._order = +order;
    }
};

Component.prototype.delete = function () {
    for (var key in Component.list) {
        if (Component.list[key].parent === this.component.localName) {
            Component.list.splice(key, 1);
            break;
        }
    }

    this.component.remove();
};

Component.prototype.render = function () {
    this.component = document.createElement(this.parent);
    this.component.innerHTML = this.htmlView.replace(/{\w*}/g, replacer.bind(this));

    return this.component;
};


function replacer(str) {
    str = str.replace(/{|}/g, "");

    switch (this.parent) {
        case "header":
        case "footer":
            return this[str];
            break;

        case "nav" :
            return this.renderSubItem(this.data);
            break;

        case "main" :
            return this.Main(str);
            break;

    }
};

Component.prototype.Main = function () {
    if (this.data.length > 0) {
        if (this.data[0]["url"] && this.data[0]["text"]) {
            return this.Articles();
        } else if (this.data[0]["surname"] && this.data[0]["age"]) {
            return this.viewAbout();
        }
    }
};

Component.prototype.Articles = function () {
    var articleItem = "";

    for (var key in this.data) {
        articleItem += '<article><a href="'
            + this.data[key]['url']
            + '">'
            + this.data[key]['name']
            + '</a> '
            + this.data[key]['text']
            + '</article>';
    }

    return articleItem;
};

Component.prototype.viewAbout = function () {
    var viewItem = "";

    for (var key in this.data) {
        viewItem += '<li>'
            + this.data[key]["name"]
            + " "
            + this.data[key]["surname"]
            + ", "
            + this.data[key]["age"]
            + " лет, "
            + this.data[key]["from"]
            + ", <a href='>"
            + this.data[key]["profile"]
            + "'>"
            + "profile"
            +"</a>"
            + '</li>';
    }

    return viewItem;
};

Component.prototype.renderSubItem = function (item) {
    var menuItem = "";
    var menuSubitem;

    for (var key in item) {
        menuSubitem = "";

        if (item[key]['items']) {
            menuSubitem = '<ul class="submenu">' + this.renderSubItem(item[key]['items']) + '</ul>';
        }

        menuItem += '<li><a href="'
            + item[key]['url']
            + '">'
            + item[key]['name']
            + '</a>'
            + menuSubitem
            + '</li>';
    }

    return menuItem;
};

Component.renderPage = function () {
    var args = [].slice.call(arguments);

    args.sort(compareOrder);

    if (Component.list.length === 0) {
        args.forEach(function (component) {
            document.body.appendChild(component.render());
            Component.list.push(component);
            console.log(component["parent"] + " rendered");
        });
    } else {
        // Заменяем компонент в Component.list
        for (var key in Component.list) {
            if (Component.list[key].parent === args[0].parent) {
                Component.list[key] = args[0];
                break;
            }
        }

        // Заменяем элемент в ДОМ
        for (var key in document.body.children) {
            if (document.body.children[key].localName === args[0].parent) {
                document.body.children[key].innerHTML = args[0].render().innerHTML;
                break;
            }
        }
    }

};


function compareOrder(component1, component2) {
    if (component1["_order"] > component2["_order"]) return 1;
    if (component1["_order"] < component2["_order"]) return -1;
}

//////////////////////////////////////////////
/////////////////////////////////////////////
Component.list = [];

var componentHeader = new Component({parent: 'header', url: './img/logo.png', title: 'Рога и Копыта'});
var componentMenu = new Component({parent: 'nav'});
var componentAbout = new Component({parent: 'main'});
var componentContact = new Component({parent: 'main'});
var componentArticles = new Component({parent: 'main'});
var componentFooter = new Component({parent: 'footer', text: '&#169; Копирайты'});
var viewHeader = '<h1><img src="{url}" alt="{title}"/>{title}</h1>';
var viewMenu = '<ul>{li}</ul>';
var viewArticle = '<section>{article}</section>';
var viewFooter = '<p><small>{text}</small</p>';
var viewAbout = '<section><h2>About</h2><ul>{li}<ul></section>';
var viewContact = '<section><h2>Contact</h2><form><textarea>Text</textarea>' +
    '<button type="submit">submit</button><form></section>';
var dataMenu = [
    {
        name: 'Главная',
        url: 'componentArticles'
    },
    {
        name: 'O нас',
        url: 'componentAbout',
        items: [
            {
                name: 'Кто мы', url: '#', items: [
                    {
                        name: 'Рога', url: '#', items: [
                            {name: 'Большие', url: '#'},
                            {name: 'Маленькие', url: '#'}
                        ]
                    },
                    {
                        name: 'Копыта', url: '#', items: [
                            {name: 'Парные', url: '#'},
                            {name: 'Непарные', url: '#'}
                        ]
                    }
                ]
            },
            {name: 'Где мы', url: '#'},
            {name: 'Откуда', url: '#'}
        ]
    },
    {
        name: 'Контакты',
        url: 'componentContact'
    }
];
var dataArticle = [
    {name: 'Статья 1', url: '#', text: 'Some text for you'},
    {name: 'Статья 2', url: '#', text: 'Some text for you'},
    {name: 'Статья 3', url: '#', text: 'Some text for you'}
];
var dataAbout = [
    {name: 'Name0', surname: 'Surname0', age: '18', profile: '#', from: 'City'},
    {name: 'Name1', surname: 'Surname1', age: '18', profile: '#', from: 'City'},
    {name: 'Name2', surname: 'Surname2', age: '18', profile: '#', from: 'City'}
];


componentHeader.setView(viewHeader);
componentMenu.setView(viewMenu, dataMenu);
componentArticles.setView(viewArticle, dataArticle);
componentFooter.setView(viewFooter);
componentContact.setView(viewContact);
componentAbout.setView(viewAbout, dataAbout);

Component.renderPage(componentHeader, componentMenu, componentArticles, componentFooter);



//////////////////////////////////// События для ссылок
document.querySelector('a[href="componentContact"]').addEventListener("click", function () {
    Component.renderPage(componentContact);
    event.preventDefault();
});

document.querySelector('a[href="componentArticles"]').addEventListener("click", function () {
    Component.renderPage(componentArticles);
    event.preventDefault();
});

document.querySelector('a[href="componentAbout"]').addEventListener("click", function () {
    Component.renderPage(componentAbout);
    event.preventDefault();
});