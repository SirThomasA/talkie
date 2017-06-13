/*
This file is part of Talkie -- text-to-speech browser extension button.
<https://joelpurra.com/projects/talkie/>

Copyright (c) 2016, 2017 Joel Purra <https://joelpurra.com/>

Talkie is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.

Talkie is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU General Public License for more details.

You should have received a copy of the GNU General Public License
along with Talkie.  If not, see <https://www.gnu.org/licenses/>.
*/

import {
    promiseTry,
} from "../promise";

import React from "react";

import StoreProvider from "../../split-environments/store-provider";
import StyletronProvider from "../../split-environments/styletron-provider";

import configurationObject from "../../configuration.json";

import ManifestProvider from "../../split-environments/manifest-provider";
import LocaleProvider from "../../split-environments/locale-provider";
import TranslatorProvider from "../../split-environments/translator-provider";
import InternalUrlProvider from "../../split-environments/internal-url-provider";
import BroadcasterProvider from "../../split-environments/broadcaster-provider";

import MetadataManager from "../metadata-manager";
import Configuration from "../configuration";

import Api from "../../split-environments/api";

import Root from "../containers/root.jsx";

const getRoot = (store, translator, configuration, styletron, broadcaster, ChildComponent) => promiseTry(() => {
    const root = <Root
        store={store}
        configuration={configuration}
        translator={translator}
        broadcaster={broadcaster}
        styletron={styletron}
    >
        <ChildComponent />
    </Root>;

    return root;
});

const autoRoot = (initialState, rootReducer, ChildComponent) => promiseTry(() => {
    const manifestProvider = new ManifestProvider();
    const internalUrlProvider = new InternalUrlProvider();
    const metadataManager = new MetadataManager(manifestProvider);
    const configuration = new Configuration(metadataManager, configurationObject, internalUrlProvider);
    const localeProvider = new LocaleProvider();
    const translatorProvider = new TranslatorProvider(localeProvider);
    const broadcasterProvider = new BroadcasterProvider();
    const api = new Api(metadataManager, configuration, translatorProvider, broadcasterProvider);

    const storeProvider = new StoreProvider();
    const store = storeProvider.createStore(initialState, rootReducer, api, null, null);

    const styletronProvider = new StyletronProvider();
    /* eslint-disable no-sync */
    const styletron = styletronProvider.getSync();
    /* eslint-enable no-sync */

    // TODO: create a generic static/default/render-time preloaded state action provider attached to the component hierarchy?
    return getRoot(store, translatorProvider, configuration, styletron, broadcasterProvider, ChildComponent)
        .then((root) => ({
            localeProvider,
            root,
            store,
            styletron,
        }));
});

export default autoRoot;
