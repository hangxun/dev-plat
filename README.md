# Device platform project technical document

## Initial angular development environment

1. Config the .angular-cli.json to generate module that out of app folder;

warning: after we change the `AppRoot` property value , we have to add the `--skip-import` suffix when we utilize the the cli to generate components, pipes..., or it will report an error `Use the skip-import option to skip importing components in NgModule`;

```bash
ng g component app/components/nav --skip-import

```

> after we generated the component ,we have to manually import it to a NgModule;

2. Integrate the jquery
    
```bash
# install jquery
npm install -s jquery
# install @types/jquery
npm install --save-dev @types/jquery
```

```js
// in .angular-cli.json 中
"scripts": [
  "../node_modules/jquery/dist/jquery.js",
],

```

```js
// in tsconfig.app.json 
"compilerOptions": {
    "types": [
      "jquery"
    ]
  },

```

3. Integrate jquery plugin 

* Install the jquery plugin

```bash
npm install jquery-modal -s
```

* Import the plugin logic in globally environment

```js
// .angular-cli.json 中
"scripts": [
  "../node_modules/jquery/dist/jquery.js",
  "../node_modules/jquery-modal/jquery.modal.min.js"
],

```

* Config the plugin declaration types

```js
// in src/typing.d.ts 中

interface JQuery {
  modal(options?:any, callback?:Function):any;
}
```
 
* Import the plugin style in the spec component or in the global style.css 

```css
/* in app.component.css 中 */
@import "~jquery-modal/jquery.modal.min.css";

```

## Init the material 

## Init the routing'

## utilize resources which we already have

1. import the fly theme.css as global styles 

```css
/* in style.css */
@import "~@angular/material/prebuilt-themes/indigo-pink.css";

/* import the fly theme css */
@import url(./assets/css/theme.css);
```

## debug environment config

* angular-cli serve config
   + --extract-css (aliases: -ec)
   + --sourcemaps (aliases: -sm, sourcemaps)
   + --open (aliases: -o) default value: false
* config npm script
  + "debug": "ng serve -sm -ec -o"

* But in @angular/cli1.7.4 we could find `Source map not working for SCSS files` (issues/9099)


```bash
# Installed css-loader and exports-loader dependencies for @angular/cli
# i) navigate to "node_modules/@angular/cli"
# ii) do: npm install --save css-loader exports-loader
# iii) Modify the file "node_modules@angular\cli\models\webpack-configs\styles.js" contents, mine was in line 180

# Replace
 const commonLoaders = [
      { loader: 'raw-loader' },
  ]; 
# with
const commonLoaders = [
        {
            loader: 'css-loader',
            options: {
                sourceMap: cssSourceMap,
                import: false,
            }
        }
    ];

# Also Replace 
// load component css as raw strings
    const rules = baseRules.map(({ test, use }) => ({
        exclude: globalStylePaths, test, use: [
            ...commonLoaders,
            {
                loader: 'postcss-loader',
                options: {
                    ident: 'embedded',
                    plugins: postcssPluginCreator,
                    sourceMap: cssSourceMap
                }
            },
            ...use
        ]
    }));
# With
// load component css as raw strings
    const rules = baseRules.map(({ test, use }) => ({
        exclude: globalStylePaths, test, use: [
                'exports-loader?module.exports.toString()',
                ...commonLoaders,
            {
                loader: 'postcss-loader',
                options: {
                    ident: 'embedded',
                    plugins: postcssPluginCreator,
                    sourceMap: cssSourceMap
                }
            },
            ...use
        ]
    }));

```

## Use the svg icons instead of images 

> use <mat-icon></mat-icon> to import our custom svg;

```ts
// the component in which we will use the svg icons 
// * we should import the HttpClientModule to our component module's , because we need it to register our custom icon to the MatIconRegistry provided by angular material;
import { Component } from "@angular/core";
import { MatIconRegistry } from "@angular/material/icon";
import { DomSanitizer } from "@angular/platform-browser";

@Component({
  selector: "app-root",
  templateUrl: "./app.component.html",
  styleUrls: ["./app.component.css"]
})
export class AppComponent{
  constructor(
    private matIconRegistry: MatIconRegistry,
    private domSanitizer: DomSanitizer
  ){
    this.matIconRegistry.addSvgIcon(
      "unicorn",
      this.domSanitizer.bypassSecurityTrustResourceUrl("../assets/unicorn_icon.svg")
    );
  }
}
```


## Init store routing  

> 對於路由當前的狀態是唯一的，即整個應用 當前只有一個路由狀態；
> 當前所激活的路由，即是自己在 routing module 中所配置的路由，即當前路由是什麽樣的，是我們自身設計的；這就意味著我們能控制當前路由的 RouterStateSnapshot 與 ActivatedRouteSnapshot 的形式；



> 想從當前激活的路由state （activated state）上面，獲取什麽信息，是由routing 序列化來決定，angular 本身就有兩個 routing state 代表當前所激活的路由狀態，我們利用序列化函數，從中選區一些項，作爲我們的state;

> routing store 也得遵循 action --> reducer 這條路綫，搞清楚即可 
   

## Initial ngrx store


1. install dependencies

```bash
npm install -s @ngrx/store@5.2.0 @ngrx/effects@5.2.0 @ngrx/router-store@5.2.0 @ngrx/store-devtools@5.2.0 @ngrx/entity@5.2.0

```

2. install and config ngrx schematics

```bash
npm install --save-dev @ngrx/schematics@5.2.0 

```
3. install ngx-store-freeze

> MetaReducer:  https://www.npmjs.com/package/ngrx-store-freeze 之所以去引入 MetaReducer 是为了使用 ngrx-store-freeze 插件，防止状态突变； 
```ts
import { StoreModule, MetaReducer, ActionReducerMap } from '@ngrx/store';
import { storeFreeze } from 'ngrx-store-freeze';
import { environment } from '../environments/environment'; // Angular CLI environment
 
export interface State {
  // reducer interfaces
}
 
export const reducers: ActionReducerMap<State> = {
  // reducers
}
 
export const metaReducers: MetaReducer<State>[] = !environment.production ? [storeFreeze]: [];
 
@NgModule({
  imports: [
    StoreModule.forRoot(reducers, { metaReducers }),
  ]
})
export class AppModule {}

```

## develop the appComponent

> the AppComponent is a router component , it have two view component NavComponent and SidenavComponent;


> warning : after we render the dom in the browser  `Angular component host element width and height are 0`, that means the host elements `<app-nav> and <app-sidenav>` height and width will be 0,  even though the child dom have height and width ; That's because the host element has the attribute `display: inline` by default. 
> if we want host element's width to be supported by his child dom , we can set the host element's style by below method; But the angular team don't suggest to do this; utilize the :host selector to do this;

```css
/* sidenav.component.css */
:host {
  margin-top: 80px;
}

```

So we can utilize the host property of the @component() config object, to config the host element style. usually we add a class to the host element, then add style to the class, that's not elegant; we can the detail in the official document `https://angular.io/guide/component-styles`  --->  using the :host selector in component's css file ; he utilize

## store the cookie which we're going to  append to the url request header to the environment 


## store reducers 中一个致命的 bug;

```ts
export function reducer(
  state: LeftMenusState = initialState,
  action: fromActions.LeftMenusAction
): LeftMenusState {
  switch (action.type) {
    case fromActions.LeftMenusActionType.LOAD_LEFT_MENUS:
      {
        return {
          ...state,
          loading: true
        };
      }

    case fromActions.LeftMenusActionType.LOAD_LEFT_MENUS_SUCCESS:
      {
        const topNavItemArray = action.payload;
        const entities = topNavItemArray.reduceRight(
          // tslint:disable-next-line:no-shadowed-variable
          (entities: {[id: number]: fromModels.TopNavItem}, topNavItem: fromModels.TopNavItem) => {
            return {
              ...entities,
              [topNavItem.id]: topNavItem
            };
          },
          {
            ...state.entities
          }
        );
        return {
          ...state,
          loading: false,
          loaded: true,
          entities: action.payload
        };
      }
    case fromActions.LeftMenusActionType.LOAD_LEFT_MENUS_FAIL:
      {
        return {
          ...state,
          loading: false,
          loaded: false
        };
      }
  }
  // this is a bug , if we don't return after @ngrx/store/init our states is still empty;
  return state;
}

```

> Bug description: 
* after @ngrx/store/init Action the leftMenus is empty which should have value of leftMenus initial state; after LOAD_LEFT_MENUS leftMenus have the value of leftMenus initial state; after  LOAD_LEFT_MENUS_SUCCESS it has the value we strive from the backbend, but after ROUTER_NAVIGATION it'll be empty; the reason is that I didn't return the default state in the reducer function;

* to understand this bug , we should know the action flow in the store: 
  + When we register the 'reducer functions' by `StoreModule.forRoot(reducers, { metaReducers })` that means every reducer's going to accept the action dispatched by the store. so when the @ngrx/store/init has been dispatched every reducer will listen to it;      
  + After the @ngrx/store/init has been dispatched our leftMenus reducer will execute it , but there isn't a case that can match the Action, so it have to return the default state, if it hasn't a default state,it will return none; so we get a empty after @ngrx/store/init action;  
  + So after the 'ROUTER_NAVIGATION' action , it will be empty; because it has no case to match the action and has nothing to return ;


1. Question1 : the procession order of effects versus reducer ? 
> when we dispatch a 'LOAD_LEFT_MENUS' action the effects will intercept the action and executes some logic, then dispatch a new action to reducer; but the reducer can also listen to the 'LOAD_LEFT_MENUS' even though it has been intercepted by the effect； the evidence is if we don't return default state in the leftMenus reducer, after @ngrx/store/init it will be empty, but when we dispatch a 'LOAD_LEFT_MENUS' which will will be intercepted by the effect , we can still get a default state; this is because the leftMenus reducer has handled this action;

```ts
// reducers
 case fromActions.LeftMenusActionType.LOAD_LEFT_MENUS:
      {
        return {
          ...state,
          loading: true
        };
      }
```

```ts
loadLeftMenus$ = this.action$.ofType(fromActions.LeftMenusActionType.LOAD_LEFT_MENUS).pipe(
    switchMap(() => {
      return this.topServices
        .getTopNavItems()
        .pipe(
          map((leftMenus) => {
            return new fromActions.LoadLeftMenusSuccess(leftMenus);
          }),
          catchError(error => of(new fromActions.LoadLeftMenusFail(error)))
        );
    })
  );

```

> we should inspect it on the chrome DevTools to see the procession;

2. question 2 , If we dispatch an action on featureStore like `constructor(private store: Store<fromStore.ProductsState>) {};  this.store.dispatch(new fromStore.LoadPizzas()); `  does the reducer which didn't register on this store can listen the action ? 
