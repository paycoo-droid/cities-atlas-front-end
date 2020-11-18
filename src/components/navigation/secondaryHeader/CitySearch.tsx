import React, {useState} from 'react';
import styled from 'styled-components/macro';
import {
  lightBaseColor,
  errorColor,
  baseColor,
} from '../../../styling/styleUtils';
import PanelSearch, {Datum} from 'react-panel-search';
import useFluent from '../../../hooks/useFluent';
import {useGlobalLocationHierarchicalTreeData} from '../../../hooks/useGlobalLocationData';
import SimpleLoader from '../../transitionStateComponents/SimpleLoader';
import SimpleError from '../../transitionStateComponents/SimpleError';
import useCurrentCityId from '../../../hooks/useCurrentCityId';
import {
  useHistory,
  matchPath,
} from 'react-router-dom';
import {
  CityRoutes,
  cityIdParam,
} from '../../../routing/routes';
import {ValueOfCityRoutes, createRoute} from '../../../routing/Utils';
import queryString from 'query-string';
import AddComparisonModal from './AddComparisonModal';
import useQueryParams from '../../../hooks/useQueryParams';

const Root = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr auto;
  grid-gap: 1rem;
  height: 100%;
  align-items: center;
`;

const LoadingContainer = styled.div`
  border: solid 1px ${lightBaseColor};
  display: flex;
  align-items: center;
  justify-content: center;
`;

const CompareDropdownRoot = styled.div`
  padding-left: 1rem;
  border-left: solid 1px #333;
`;

const ButtonBase = styled.button`
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: transparent;
  text-transform: uppercase;
  position: relative;
`;

const AddComparisonButton = styled(ButtonBase)`
  font-size: 0.85rem;
  border: dashed 1px ${lightBaseColor};
  padding: 0.4rem 0.5rem 0.4rem 1.65rem;
  color: ${baseColor};
  outline: none;

  &:before {
    font-size: 1.85rem;
    content: '+';
    left: 0.15rem;
    position: absolute;
  }

  &:hover, &:focus {
    background-color: #fff;
  }

  &:active {
    color: ${baseColor};
  }
`;

const RemoveComparisonButton = styled(ButtonBase)`
  color: ${errorColor};
  outline: 0 solid rgba(255, 255, 255, 0);
  font-size: clamp(0.65rem, 1vw, 1rem);
  padding: 0 0.25rem;
  transition: outline 0.1s ease;

  &:before {
    font-size: 1.25rem;
    margin-right: 0.35rem;
    content: '✕';
    transform: translate(1%, 0);
  }

  &:hover, &:focus {
    background-color: #fff;
    outline: 0.25rem solid #fff;
  }

  &:active {
    color: ${errorColor};
  }

  @media (max-width: 1280px) {
    max-width: 90px;
  }
`;

const SecondaryHeader = () => {
  const getString = useFluent();
  const cityId = useCurrentCityId();
  const history = useHistory();
  const { compare_city, ...otherParams } = useQueryParams();
  const [modalOpen, setModalOpen] = useState<boolean>(false);

  const {loading, error, data} = useGlobalLocationHierarchicalTreeData();
  let output: React.ReactElement<any> | null;
  if (loading) {
    output = (
      <LoadingContainer>
        <SimpleLoader />
      </LoadingContainer>
    );
  } else if (error !== undefined) {
    console.error(error);
    output = (
      <LoadingContainer>
        <SimpleError />
      </LoadingContainer>
    );
  } else if (data !== undefined) {
    const initialSelected = data.find(({id}) => id === cityId);
    const onSelect = (d: Datum | null) => {
      if (d) {
        Object.entries(CityRoutes).forEach(([_key, value]) => {
          const match = matchPath<{[cityIdParam]: string}>(history.location.pathname, value);
          if (match && match.isExact && match.path) {
            history.push(createRoute.city(match.path as ValueOfCityRoutes, d.id.toString()) + history.location.search);
          }
        });
      }
    };
    let compareDropdown: React.ReactElement<any>;
    if (compare_city === undefined) {
      compareDropdown = (
        <div>
          <AddComparisonButton onClick={() => setModalOpen(true)}>
            {getString('global-ui-add-comparison')}
          </AddComparisonButton>
        </div>
      );
    } else {
      const onSelectComparison = (d: Datum | null) => {
        if (d) {
          const query = queryString.stringify({...otherParams, compare_city: d.id});
          const newUrl = query ? history.location.pathname + '?' + query : history.location.pathname;
          history.push(newUrl);
        }
      };
      const removeComparison = () => {
        let path: string = history.location.pathname;
        const isIndustryComparison = matchPath<{[cityIdParam]: string}>(
          path, CityRoutes.CityEconomicCompositionIndustryCompare,
        );
        if (isIndustryComparison && isIndustryComparison.isExact && cityId !== null) {
          path = createRoute.city(CityRoutes.CityEconomicComposition, cityId);
        }
        const query = queryString.stringify({...otherParams});
        const newUrl = query ? path + '?' + query : path;
        history.push(newUrl);
      };
      compareDropdown = (
        <>
          <CompareDropdownRoot>
            <PanelSearch
              data={data.filter(({id}) => id !== cityId)}
              topLevelTitle={getString('global-text-countries')}
              disallowSelectionLevels={['0']}
              defaultPlaceholderText={getString('global-ui-type-a-city-name')}
              showCount={true}
              resultsIdentation={1.75}
              neverEmpty={true}
              selectedValue={data.find(({id}) => id === compare_city)}
              onSelect={onSelectComparison}
              maxResults={500}
            />
          </CompareDropdownRoot>
          <div>
            <RemoveComparisonButton onClick={removeComparison}>
              {getString('global-ui-remove-comparison')}
            </RemoveComparisonButton>
          </div>
        </>
      );
    }
    const closeModal = () => {
      setModalOpen(false);
    };
    const compareModal = modalOpen ? (
      <AddComparisonModal
        closeModal={closeModal}
        data={data}
      />
    ) : null;
    output = (
      <>
        <PanelSearch
          data={compare_city !== undefined ? data.filter(({id}) => id !== compare_city) : data}
          topLevelTitle={getString('global-text-countries')}
          disallowSelectionLevels={['0']}
          defaultPlaceholderText={getString('global-ui-type-a-city-name')}
          showCount={true}
          resultsIdentation={1.75}
          neverEmpty={true}
          selectedValue={initialSelected ? initialSelected : undefined}
          onSelect={onSelect}
          maxResults={500}
        />
        {compareDropdown}
        {compareModal}
      </>
    );
  } else {
    output = null;
  }
  return (
    <Root>{output}</Root>
  );
};

export default SecondaryHeader;
