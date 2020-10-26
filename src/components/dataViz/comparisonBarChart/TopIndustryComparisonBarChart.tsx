import React, {useEffect, useState, useRef} from 'react';
import { useQuery, gql } from '@apollo/client';
import {
  CityIndustryYear,
  DigitLevel,
  ClassificationNaicsIndustry,
  CompositionType,
} from '../../../types/graphQL/graphQLTypes';
import {
  useGlobalIndustryMap,
} from '../../../hooks/useGlobalIndustriesData';
import {
  usePrevious,
  useWindowSize,
} from 'react-use';
import {breakPoints} from '../../../styling/GlobalGrid';
import PreChartRow from '../../../components/general/PreChartRow';
import ErrorBoundary from '../ErrorBoundary';
import styled from 'styled-components/macro';
import {
  sectorColorMap,
} from '../../../styling/styleUtils';
import SimpleError from '../../transitionStateComponents/SimpleError';
import LoadingBlock, {LoadingOverlay} from '../../transitionStateComponents/VizLoadingBlock';
import Chart, {FilteredDatum} from './Chart';

const Root = styled.div`
  width: 100%;
  height: 100%;
  grid-column: 1 / -1;
  grid-row: 2;
  position: relative;

  @media ${breakPoints.small} {
    grid-row: 3;
    grid-column: 1;
  }
`;

const VizContainer = styled.div`
  width: 100%;
  height: 100%;
  position: absolute;

  .react-comparison-bar-chart-title {
    h2 {
      text-transform: none;
    }
  }
`;

const ECONOMIC_COMPOSITION_COMPARISON_QUERY = gql`
  query GetCityIndustryTreeData($primaryCity: Int!, $secondaryCity: Int!, $year: Int!) {
    primaryCityIndustries: cityIndustryYearList(cityId: $primaryCity, year: $year) {
      id
      naicsId
      numCompany
      numEmploy
    }
    secondaryCityIndustries: cityIndustryYearList(cityId: $secondaryCity, year: $year) {
      id
      naicsId
      numCompany
      numEmploy
    }
  }
`;

interface IndustriesList {
  id: CityIndustryYear['id'];
  naicsId: CityIndustryYear['naicsId'];
  numCompany: CityIndustryYear['numCompany'];
  numEmploy: CityIndustryYear['numEmploy'];
}

interface SuccessResponse {
  primaryCityIndustries: IndustriesList[];
  secondaryCityIndustries: IndustriesList[];
}

interface Variables {
  primaryCity: number;
  secondaryCity: number;
  year: number;
}

const useEconomicCompositionComparisonQuery = (variables: Variables) =>
  useQuery<SuccessResponse, Variables>(ECONOMIC_COMPOSITION_COMPARISON_QUERY, { variables });

interface Props {
  primaryCity: number;
  secondaryCity: number;
  year: number;
  highlighted: string | undefined;
  digitLevel: DigitLevel;
  compositionType: CompositionType;
  hiddenSectors: ClassificationNaicsIndustry['id'][];
  openHowToReadModal?: () => void;
  setHighlighted: (value: string | undefined) => void;
}

const TopIndustryComparisonBarChart = (props: Props) => {
  const {
    primaryCity, secondaryCity, year, digitLevel, compositionType, hiddenSectors,
    openHowToReadModal, setHighlighted,
  } = props;

  const industryMap = useGlobalIndustryMap();
  const windowDimensions = useWindowSize();
  const {loading, error, data} = useEconomicCompositionComparisonQuery({primaryCity, secondaryCity, year});
  const rootRef = useRef<HTMLDivElement | null>(null);
  const [dimensions, setDimensions] = useState<{width: number, height: number} | undefined>(undefined);
  useEffect(() => {
    const node = rootRef.current;
    if (node) {
      setTimeout(() => {
        const {width, height} = node.getBoundingClientRect();
        setDimensions({width, height});
      }, 0);
    }
  }, [rootRef, windowDimensions]);

  const prevData = usePrevious(data);
  let dataToUse: SuccessResponse | undefined;
  if (data) {
    dataToUse = data;
  } else if (prevData) {
    dataToUse = prevData;
  } else {
    dataToUse = undefined;
  }

  let output: React.ReactElement<any> | null;
  if (industryMap.loading || !dimensions || (loading && prevData === undefined)) {
    output = <LoadingBlock />;
  } else if (error !== undefined) {
    output = (
      <LoadingOverlay>
        <SimpleError />
      </LoadingOverlay>
    );
    console.error(error);
  }  else if (industryMap.error !== undefined) {
    output = (
      <LoadingOverlay>
        <SimpleError />
      </LoadingOverlay>
    );
    console.error(error);
  } else if (dataToUse !== undefined) {
    const {primaryCityIndustries, secondaryCityIndustries} = dataToUse;
    let primaryTotal = 0;
    let secondaryTotal = 0;
    const filteredPrimaryData: FilteredDatum[] = [];
    primaryCityIndustries.forEach(({naicsId, numCompany, numEmploy}) => {
      const industry = industryMap.data[naicsId];
      if (industry && industry.level === digitLevel) {
        const {name, topLevelParentId} = industry;
        const colorDatum = sectorColorMap.find(s => s.id === topLevelParentId);
        if (!hiddenSectors.includes(topLevelParentId) && colorDatum) {
          const companies = numCompany ? numCompany : 0;
          const employees = numEmploy ? numEmploy : 0;
          primaryTotal = compositionType === CompositionType.Companies ? primaryTotal + companies : primaryTotal + employees;
          filteredPrimaryData.push({
            id: naicsId,
            value: compositionType === CompositionType.Companies ? companies : employees,
            title: name ? name : '',
            topLevelParentId,
            color: colorDatum.color,
          });
        }
      }
    });
    const filteredSecondaryData: FilteredDatum[] = [];
    secondaryCityIndustries.forEach(({naicsId, numCompany, numEmploy}) => {
      const industry = industryMap.data[naicsId];
      if (industry && industry.level === digitLevel) {
        const {name, topLevelParentId} = industry;
        const colorDatum = sectorColorMap.find(s => s.id === topLevelParentId);
        if (!hiddenSectors.includes(topLevelParentId) && colorDatum) {
          const companies = numCompany ? numCompany : 0;
          const employees = numEmploy ? numEmploy : 0;
          secondaryTotal = compositionType === CompositionType.Companies ? secondaryTotal + companies : secondaryTotal + employees;
          filteredSecondaryData.push({
            id: naicsId,
            value: compositionType === CompositionType.Companies ? companies : employees,
            title: name ? name : '',
            topLevelParentId,
            color: colorDatum.color,
          });
        }
      }
    });
    if (!filteredPrimaryData.length && !filteredSecondaryData.length) {
      output = (
        <LoadingOverlay>
          <SimpleError fluentMessageId={'global-ui-error-no-sectors-selected'} />
        </LoadingOverlay>
      );
    } else {
      const loadingOverlay = loading ? <LoadingBlock /> : null;
      output = (
        <VizContainer style={{height: dimensions.height}}>
            <ErrorBoundary>
              <Chart
                filteredPrimaryData={filteredPrimaryData}
                filteredSecondaryData={filteredSecondaryData}
                primaryTotal={primaryTotal}
                secondaryTotal={secondaryTotal}
                primaryCityId={primaryCity}
                secondaryCityId={secondaryCity}
              />
            </ErrorBoundary>
          {loadingOverlay}
        </VizContainer>
      );
    }
  } else {
    output = null;
  }

  return (
    <>
      <PreChartRow
        onReadThisChart={openHowToReadModal}
        searchInGraphOptions={{hiddenSectors, digitLevel, setHighlighted}}
        settingsOptions={{compositionType: true, digitLevel: true}}
      />
      <Root ref={rootRef}>
        {output}
      </Root>
    </>
  );
};

export default TopIndustryComparisonBarChart;