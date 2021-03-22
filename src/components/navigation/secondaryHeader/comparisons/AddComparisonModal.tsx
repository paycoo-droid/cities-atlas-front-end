import React, {useState, useRef} from 'react';
import BasicModal from '../../../standardModal/BasicModal';
import styled from 'styled-components/macro';
import {
  secondaryFont,
  SearchContainerDark,
  backgroundDark,
  radioButtonCss,
} from '../../../../styling/styleUtils';
import useFluent from '../../../../hooks/useFluent';
import PanelSearch, {Datum} from 'react-panel-search';
import useCurrentCityId from '../../../../hooks/useCurrentCityId';
import useGlobalLocationData from '../../../../hooks/useGlobalLocationData';
import {
  useHistory,
} from 'react-router-dom';
import queryString from 'query-string';
import useQueryParams from '../../../../hooks/useQueryParams';
import {RegionGroup} from '../../../dataViz/comparisonBarChart/cityIndustryComparisonQuery';
import matchingKeywordFormatter from '../../../../styling/utils/panelSearchKeywordFormatter';
import {TooltipTheme} from '../../../general/Tooltip';
import {PeerGroup} from '../../../../types/graphQL/graphQLTypes';

const mobileWidth = 750; // in px

const Root = styled.div`
  font-family: ${secondaryFont};
  color: #fff;
  width: 800px;
  max-width: 100%;
  height: 600px;
  max-height: 70vh;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;

  @media (max-width: 900px) {
    width: 100%;
  }
`;

const H1 = styled.h1`
  text-transform: uppercase;
  font-weight: 400;
  text-align: center;
  margin-bottom: 4rem;
`;

const Label = styled.label`
  text-transform: uppercase;
  padding-bottom: 0.2rem;
  display: block;
  width: 100%;
`;

const LabelUnderline = styled(Label)`
  border-bottom: solid 1px #fff;
`;

const Grid = styled.div`
  display: grid;
  grid-template-columns: 1fr auto 1.5fr;
  grid-gap: 2rem;

  @media (max-width: ${mobileWidth}px) {
    grid-template-columns: auto;
    grid-template-rows: auto auto auto;
  }

  .react-panel-search-search-bar-input {
    background-color: #454a4f;
  }

  .react-panel-search-highlighted-item {
    background-color: rgba(255, 255, 255, 0.25);
  }

  .react-panel-search-search-results {
    background-color: #454a4f;
  }
`;

const GlobalVRegionalGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  grid-gap: 0.75rem;
`;

const GroupContainer = styled.ul`
  border: solid 1px #fff;
  padding: 0.5rem;
  margin: 0;
`;

const ContainerTitle = styled.h3`
  color: #fff;
  font-weight: 400;
  margin-bottom: 0.4rem;
`;

const Or = styled.div`
  text-transform: uppercase;
  font-size: 1.5rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;

  &:before,
  &:after {
    content: '';
    height: 5rem;
    width: 0;
    border-right: solid 2px #fff;
  }

  &:before {
    margin-bottom: 0.5rem;
  }

  &:after {
    margin-top: 0.5rem;
  }

  @media (max-width: ${mobileWidth}px) {
    flex-direction: row;

    &:before,
    &:after {
      content: '';
      height: 0;
      width: 3rem;
      border-top: solid 2px #fff;
    }

    &:before {
      margin-bottom: 0;
      margin-right: 0.5rem;
    }

    &:after {
      margin-left: 0.5rem;
      margin-top: 0;
    }
  }
`;

const ContinueButtonContainer = styled.div`
  margin-top: auto;
  display: flex;
  justify-content: flex-end;
`;

const ContinueButton = styled.button`
  background-color: transparent;
  border: solid 1px #fff;
  text-transform: uppercase;
  color: #fff;
  font-family: ${secondaryFont};
  font-size: 1.25rem;
  padding: 0.6rem 1rem;
  transition: opacity 0.2s ease-in-out;

  &:hover:not(:disabled) {
    background-color: #fff;
    color: ${backgroundDark};
  }

  &:disabled {
    cursor: not-allowed;
    opacity: 0.5;
  }
`;

const GroupsList = styled.ul`
  padding: 0;
`;

const GroupItem = styled.li`
  margin-bottom: 0.5rem;
  display: block;
  list-style: none;
  font-size: 0.875rem;
`;

const GroupRadio = styled.div`
  ${radioButtonCss}
  cursor: pointer;
  padding: 0.5rem 0.25rem;

  &:hover {
    background-color: #fff;
  }

  &:before {
    margin-right: 16px;
  }
`;

const SimilarCitiesList = styled.ol`
  background-color: #454a4e;
  padding: 0.65rem;
  margin-top: 1rem;
  box-sizing: border-box;
  max-height: 130px;
  overflow: auto;

  ::-webkit-scrollbar {
    -webkit-appearance: none;
    width: 7px;
  }
  ::-webkit-scrollbar-thumb {
    border-radius: 4px;
    background-color: rgba(255, 255, 255, .3);
  }
  ::-webkit-scrollbar-track {
    background-color: rgba(255, 255, 255, .1);
  }
`;
const SimilarCity = styled.li`
  font-size: 0.75rem;
  color: #fff;
  margin-left: 2rem;
`;

interface Props {
  closeModal: (value: string | undefined) => void;
  data: Datum[];
  field: 'benchmark' | 'compare_city';
}

const AddComparisonModal = (props: Props) => {
  const {closeModal, data, field} = props;
  const getString = useFluent();
  const cityId = useCurrentCityId();
  const continueButtonRef = useRef<HTMLButtonElement | null>(null);
  const {data: globalData} = useGlobalLocationData();
  const history = useHistory();
  const { compare_city, benchmark, ...otherParams } = useQueryParams();
  let intialSelected: Datum | null | RegionGroup | PeerGroup = null;
  if (field === 'benchmark' && benchmark) {
    if (benchmark === PeerGroup.GlobalIncome || benchmark === PeerGroup.GlobalPopulation ||
        benchmark === PeerGroup.RegionalIncome || benchmark === PeerGroup.RegionalPopulation) {
      intialSelected = benchmark;
    }
  } else if (field === 'compare_city' && compare_city) {
    if (compare_city === RegionGroup.World || compare_city === RegionGroup.SimilarCities) {
      intialSelected = compare_city;
    }
  }
  const [selected, setSelected] = useState<Datum | null | RegionGroup | PeerGroup>(intialSelected);

  const currentCity = globalData ? globalData.cities.find(c => c.cityId === cityId) : undefined;
  const name = currentCity ? currentCity.name : '';

  const selectCity = (city: Datum | null) => {
    setSelected(city);
    if (continueButtonRef && continueButtonRef.current) {
      const node = continueButtonRef.current;
      setTimeout(() => {
        node.focus();
      }, 0);
    }
  };

  const onContinue = () => {
    if (selected && typeof selected === 'object') {
      const query = queryString.stringify({...otherParams, compare_city, benchmark, [field]: selected.id});
      const newUrl = query ? history.location.pathname + '?' + query :history.location.pathname;
      history.push(newUrl);
      closeModal(selected.id.toString());
    } else if (typeof selected === 'string') {
      const query = queryString.stringify({...otherParams, compare_city, benchmark, [field]: selected});
      const newUrl = query ? history.location.pathname + '?' + query :history.location.pathname;
      history.push(newUrl);
      closeModal(RegionGroup.World);
    }
  };

  const prevValue = field === 'benchmark' ? benchmark : compare_city;
  const closeModalWithoutConfirming = prevValue === undefined && field === 'benchmark'
    ? undefined
    : () => closeModal(prevValue);

  const groups = field === 'compare_city' ? (
    <div>
      <LabelUnderline>{getString('global-ui-select-a-group')}</LabelUnderline>
      <GroupsList>
        <GroupItem>
          <GroupRadio
            onClick={() => setSelected(RegionGroup.World)}
            $checked={selected === RegionGroup.World}
          >
            {getString('global-text-world')}
          </GroupRadio>
        </GroupItem>
        <GroupItem>
          <GroupRadio
            onClick={() => setSelected(RegionGroup.SimilarCities)}
            $checked={selected === RegionGroup.SimilarCities}
          >
            {getString('global-text-similar-cities')} (10)
          </GroupRadio>
          <SimilarCitiesList>
            <SimilarCity>First Group Name</SimilarCity>
            <SimilarCity>Second Group Name</SimilarCity>
            <SimilarCity>Third Group Name</SimilarCity>
            <SimilarCity>Fourth Group Name</SimilarCity>
            <SimilarCity>Fifth Group Name</SimilarCity>
            <SimilarCity>Sixth Group Name</SimilarCity>
            <SimilarCity>Seventh Group Name</SimilarCity>
            <SimilarCity>Eight Group Name</SimilarCity>
            <SimilarCity>Ninth Group Name</SimilarCity>
            <SimilarCity>Tenth Group Name</SimilarCity>
          </SimilarCitiesList>
        </GroupItem>
      </GroupsList>
    </div>
  ) : (
    <div>
      <LabelUnderline>{getString('global-ui-select-peer-group')}</LabelUnderline>
      <GlobalVRegionalGrid>
        <div>
        <ContainerTitle>{getString('global-text-global-peers')}</ContainerTitle>
        <GroupContainer>
            <GroupItem>
              <GroupRadio
                onClick={() => setSelected(PeerGroup.GlobalPopulation)}
                $checked={selected === PeerGroup.GlobalPopulation}
              >
                {getString('global-text-similar-population')}
              </GroupRadio>
            </GroupItem>
            <GroupItem>
              <GroupRadio
                onClick={() => setSelected(PeerGroup.GlobalIncome)}
                $checked={selected === PeerGroup.GlobalIncome}
              >
                {getString('global-text-similar-income')}
              </GroupRadio>
            </GroupItem>
          </GroupContainer>
        </div>
        <div>
        <ContainerTitle>{getString('global-text-regional-peers')}</ContainerTitle>
          <GroupContainer>
            <GroupItem>
              <GroupRadio
                onClick={() => setSelected(PeerGroup.RegionalPopulation)}
                $checked={selected === PeerGroup.RegionalPopulation}
              >
                {getString('global-text-similar-population')}
              </GroupRadio>
            </GroupItem>
            <GroupItem>
              <GroupRadio
                onClick={() => setSelected(PeerGroup.RegionalIncome)}
                $checked={selected === PeerGroup.RegionalIncome}
              >
                {getString('global-text-similar-income')}
              </GroupRadio>
            </GroupItem>
          </GroupContainer>
        </div>
      </GlobalVRegionalGrid>
    </div>
  );

  return (
    <BasicModal onClose={closeModalWithoutConfirming} width={'auto'} height={'auto'}>
      <Root>
        <H1>{getString('global-ui-compare-title', {name})}:</H1>
        <SearchContainerDark>
          <Grid>
            <div>
              <Label>{getString('global-ui-select-a-city-name')}</Label>
              <PanelSearch
                data={data.filter(({id}) => id !== cityId)}
                topLevelTitle={getString('global-text-countries')}
                disallowSelectionLevels={['0']}
                defaultPlaceholderText={getString('global-ui-type-a-city-name')}
                showCount={true}
                resultsIdentation={1.75}
                neverEmpty={false}
                maxResults={500}
                selectedValue={typeof selected === 'object' ? selected : null}
                onSelect={selectCity}
                focusOnRender={true}
                matchingKeywordFormatter={matchingKeywordFormatter(TooltipTheme.Dark)}
              />
            </div>
            <Or>{getString('global-ui-or')}</Or>
            {groups}
          </Grid>
        </SearchContainerDark>
        <ContinueButtonContainer>
          <ContinueButton
            onClick={onContinue}
            ref={continueButtonRef}
            disabled={!selected}
          >
            {getString('global-ui-continue')}
          </ContinueButton>
        </ContinueButtonContainer>
      </Root>
    </BasicModal>
  );
};

export default AddComparisonModal;