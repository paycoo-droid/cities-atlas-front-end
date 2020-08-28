import React, {useEffect, useState} from 'react';
import {SecondaryHeaderContainer} from '../../../styling/GlobalGrid';
import styled from 'styled-components/macro';
import {
  backgroundMedium,
  defaultPadding,
  secondaryFont,
  tertiaryColor,
  lightBaseColor,
} from '../../../styling/styleUtils';
import {CitiesGeoJsonData} from '../../../data/citiesTypes';
import raw from 'raw.macro';
import PanelSearch, {Datum as SearchDatum} from 'react-panel-search';

const geoJsonData: CitiesGeoJsonData = JSON.parse(raw('../../../data/cities.json'));

const Root = styled(SecondaryHeaderContainer)`
  background-color: ${backgroundMedium};
  padding: ${defaultPadding * 0.5}rem ${defaultPadding}rem;
`;

const SearchContainer = styled.div`
  max-width: 350px;
  width: 100%;
  font-family: ${secondaryFont};

  .react-panel-search-search-bar-input,
  button {
    font-family: ${secondaryFont};
  }

  .react-panel-search-search-bar-input {
    text-transform: uppercase;
    background-color: ${backgroundMedium};
    border: solid 1px ${lightBaseColor};
    box-shadow: none;
    outline: none;

    &:focus::placeholder {
      color: ${backgroundMedium};
    }
  }

  .react-panel-search-current-tier-breadcrumb-outer,
  .react-panel-search-next-button,
  .react-panel-search-search-bar-dropdown-arrow {
    svg polyline {
      stroke: ${lightBaseColor};
    }
  }
  .react-panel-search-search-bar-dropdown-arrow,
  .react-panel-search-search-bar-clear-button {
    background-color: ${backgroundMedium};
  }

  .react-panel-search-search-bar-search-icon {
    svg path {
      fill: ${lightBaseColor};
    }
  }

  .react-panel-search-search-results {
    border-left: solid 1px ${lightBaseColor};
    border-right: solid 1px ${lightBaseColor};
    border-bottom: solid 1px ${lightBaseColor};
  }

  .react-panel-search-current-tier-title,
  .react-panel-search-current-tier-breadcrumb-outer {
    border-color: ${tertiaryColor};
  }

`;

const SecondaryHeader = () => {
  const [data, setData] = useState<SearchDatum[]>([]);


  useEffect(() => {
    const searchData: SearchDatum[] = [];
    geoJsonData.features.forEach(({properties}, i) => {
      const {
        CTR_MN_NM: countryName, CTR_MN_ISO: parent_id, UC_NM_MN: title,
        UC_NM_LST, AREA,
      } = properties;
      const parentIndex = searchData.findIndex(d => d.id === parent_id);
      if (parentIndex === -1) {
        searchData.push({
          id: parent_id,
          title: countryName,
          parent_id: null,
          level: '0',
        });
      }
      const id = parent_id + '-' + title + '-' + UC_NM_LST + '-' + AREA + '-' + i;
      const searchDatum: SearchDatum = {
        id,
        title: title + ', ' + countryName,
        parent_id,
        level: '1',
      };
      searchData.push(searchDatum);
    });
    setData(searchData);
  }, []);

  return (
    <Root>
      <SearchContainer>
        <PanelSearch
          data={data}
          topLevelTitle={'Countries'}
          disallowSelectionLevels={['0']}
          defaultPlaceholderText={'Type a city name'}
          showCount={true}
          resultsIdentation={1.75}
          neverEmpty={true}
        />
      </SearchContainer>
    </Root>
  );
};

export default SecondaryHeader;