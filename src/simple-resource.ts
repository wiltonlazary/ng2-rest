
import { Observable } from 'rxjs/Observable';
import { Subject } from 'rxjs/Subject';
import { Subscription } from 'rxjs/Subscription';

import 'rxjs/add/operator/map';

import { Resource, ResourceModel } from './resource.service';
import { Rest as ModuleRest } from './rest';
import { UrlNestedParams } from './nested-params';
import { MockBackend, MockRequest, MockResponse } from './mock-backend';
import { Rest } from "./rest.class";
import { RestHeaders } from './rest-headers';


export interface Mock<A> {
    controller: (req: MockRequest<A>, timeout?: number, howManyModels?: number) => MockResponse;
    timeout: number;
    howManyMock: number;
    data: any;
}

export interface RestPromises<A, TA, QP extends ModuleRest.UrlParams> {
    get: (queryParams?: QP) => Promise<A>;
    query: (queryParams?: QP) => Promise<TA>;
    save: (item?: A, queryParams?: QP) => Promise<A>;
    update: (item?: A, queryParams?: QP) => Promise<A>;
    remove: (queryParams?: QP) => Promise<A>;
}

export interface Model<A, TA, RP extends Object, QP extends ModuleRest.UrlParams> {
    (restParams?: RP): RestPromises<A, TA, QP>;
}




/**
 *
 * @export
 * @abstract
 * @class SimpleResource
 * @extends {Resource<T, A, TA>}
 * @template E  Endpoint type
 * @template A Single modle type
 * @template TA Array Model Type
 * @template RP rest url parameters type
 * @template QP query parameter type
 */
class ExtendedResource<E, A, TA, RP extends Object, QP extends ModuleRest.UrlParams>  {
    public static doNotSerializeQueryParams = false;
    public static handlers: Subscription[] = [];
    mock: Mock<A> = <Mock<A>>{ timeout: 100, howManyMock: 100, data: undefined };

    rest: ResourceModel<A, TA>;

    /**
     * Get model by rest params
    */
    model: Model<A, TA, RP, QP> = (restParams?: RP) => {

        return {

            get: (queryPrams?: QP) => {
                return new Promise<A>((resolve, reject) => {
                    ExtendedResource.handlers.push(this.rest.model(restParams)
                        .mock(this.mock.data, this.mock.timeout, this.mock.controller)
                        .get([queryPrams], ExtendedResource.doNotSerializeQueryParams)
                        .subscribe(
                        data => resolve(data),
                        err => reject(err)))
                })
            },

            query: (queryPrams?: QP) => {
                return new Promise<TA>((resolve, reject) => {

                    ExtendedResource.handlers.push(this.rest.model(restParams)
                        .mock(this.mock.data, this.mock.timeout, this.mock.controller)
                        .query([queryPrams], ExtendedResource.doNotSerializeQueryParams)
                        .subscribe(
                        data => resolve(data),
                        err => reject(err)))

                })
            },


            save: (item: A, queryParams?: QP) => {
                return new Promise<A>((resolve, reject) => {

                    ExtendedResource.handlers.push(this.rest.model(restParams)
                        .mock(this.mock.data, this.mock.timeout, this.mock.controller)
                        .save(item, [queryParams], ExtendedResource.doNotSerializeQueryParams)
                        .subscribe(
                        data => resolve(data),
                        err => reject(err)))

                })
            },


            update: (item: A, queryParams?: QP) => {
                return new Promise<A>((resolve, reject) => {

                    ExtendedResource.handlers.push(this.rest.model(restParams)
                        .mock(this.mock.data, this.mock.timeout, this.mock.controller)
                        .update(item, [queryParams], ExtendedResource.doNotSerializeQueryParams)
                        .subscribe(
                        data => resolve(data),
                        err => reject(err)))

                })
            },


            remove: (queryPrams?: QP) => {
                return new Promise<A>((resolve, reject) => {

                    ExtendedResource.handlers.push(this.rest.model(restParams)
                        .mock(this.mock.data, this.mock.timeout, this.mock.controller)
                        .remove([queryPrams], ExtendedResource.doNotSerializeQueryParams)
                        .subscribe(
                        data => resolve(data),
                        err => reject(err)))

                })
            }


        }
    }


    // add(endpoint: E, model: string, group?: string, name?: string, description?: string) { }

    public constructor(private endpoint: E | string, private path_model: string) {
        this.rest = <any>Resource.create<A, TA>(<any>endpoint, path_model);

    }

}



/**
 *
 * @export
 * @class SimpleResource
 * @template A single model type
 * @template TA array model type
 * @template RP rest parameters type
 * @template QP query parameters type
 */
export class SimpleResource<A, TA> {
    model: Model<A, TA, Object, ModuleRest.UrlParams>;
    mock: Mock<A>;

    private static _isSetQueryParamsSerialization = false;
    public static set doNotSerializeQueryParams(value) {
        if (!SimpleResource._isSetQueryParamsSerialization) {
            SimpleResource._isSetQueryParamsSerialization = true;
            ExtendedResource.doNotSerializeQueryParams = value
            return;
        }
        console.warn(`Query params serialization already set as 
        ${ExtendedResource.doNotSerializeQueryParams},`);
    }


    /**
     * Should be called in ngDestroy()
     */
    destroy: () => void;

    public static get mockingMode() {
        return Resource.mockingMode;
    }

    public static get headers() {
        return Resource.Headers;
    }

    public static __destroy() {
        ExtendedResource.handlers.forEach(h => h.unsubscribe());
    }

    constructor(endpoint: string, model: string) {
        let rest = new ExtendedResource<string, A, TA, Object, ModuleRest.UrlParams>(endpoint, model);
        this.model = rest.model;
        this.mock = rest.mock;
        this.destroy = () => {
            ExtendedResource.handlers.forEach(h => h.unsubscribe());
        }
    }

}
