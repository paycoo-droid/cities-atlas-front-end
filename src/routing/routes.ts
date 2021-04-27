import {CompositionType} from '../types/graphQL/graphQLTypes';

// param must be specified in each route in order to enforce typechecking
export const cityIdParam = 'cityId';

export const CityRoutes = {
  CityBase: '/city/:cityId',
  CityEconomicComposition: '/city/:cityId/economic-composition',
  CityEconomicCompositionIndustryCompare: '/city/:cityId/economic-composition/compare-industries',
  CitySimilarCities: '/city/:cityId/similar-cities',
  CityGoodAt: '/city/:cityId/good-at',
  CityIndustrySpacePosition: '/city/:cityId/industry-position',
  CityGrowthOpportunities: '/city/:cityId/growth-opportunities',
  CityGrowthOpportunitiesTable: '/city/:cityId/growth-opportunities/table',
} as const;

export const AboutRoutes = {
  AboutBase: '/about',
};

export const DataRoutes = {
  DataBase: '/data',
  DataAbout: '/data/about',
  DataCleaning: '/data/cleaning',
  DataUpdates: '/data/updates',
  DataClassifications: '/data/classifications',
};

export const ContactRoutes = {
  ContactBase: '/contact',
};

export const Routes = {
  Landing: '/',
  ...CityRoutes,
  ...AboutRoutes,
  ...DataRoutes,
  ...ContactRoutes,
} as const;

export enum ClusterMode {
  outline = 'outline',
  overlay = 'overlay',
  none = 'none',
}

export const defaultClusterMode: ClusterMode = ClusterMode.outline;

export enum NodeSizing {
  uniform = 'uniform',
  globalCompanies = 'global_companies',
  globalEmployees = 'global_employees',
  cityCompanies = 'city_companies',
  cityEmployees = 'city_employees',
}

export const defaultNodeSizing: NodeSizing = NodeSizing.cityEmployees;

export enum ColorBy {
  sector = 'sector',
  education = 'education',
  wage = 'wage',
}

export enum CityNodeSizing {
  uniform = 'uniform',
  population = 'population',
  gdpPpp = 'gdpPpp',
}

export const defaultCityNodeSizing: CityNodeSizing = CityNodeSizing.population;

export enum CityColorBy {
  proximity = 'proximity',
}

export enum ClusterLevel {
  C1 = '1',
  C2 = '2',
  C3 = '3',
}

export enum AggregationMode {
  cluster = 'clusters',
  industries = 'industries',
}

export const defaultAggregationMode: AggregationMode = AggregationMode.industries;

export const defaultClusterLevel: ClusterLevel = ClusterLevel.C3;
export const defaultColorBy: ColorBy = ColorBy.sector;

export interface GlobalQueryParams {
  benchmark: string | undefined;
  compare_city: string | undefined;
  digit_level: string | undefined;
  composition_type: CompositionType | undefined;
  aggregation: AggregationMode | undefined;
  cluster_overlay: ClusterMode | undefined;
  node_sizing: NodeSizing | undefined;
  color_by: ColorBy | undefined;
  city_node_sizing: CityNodeSizing | undefined;
  city_color_by: CityColorBy | undefined;
  cluster_level: ClusterLevel | undefined;
  rca_threshold: string | undefined;
}
