import React, {useEffect, useState, useRef} from 'react';
import {
  DigitLevel,
  ClassificationNaicsIndustry,
  ClassificationNaicsCluster,
} from '../../../types/graphQL/graphQLTypes';
import {
  useGlobalIndustryMap,
} from '../../../hooks/useGlobalIndustriesData';
import {
  usePrevious,
} from 'react-use';
import {useWindowWidth} from '../../../contextProviders/appContext';
import {breakPoints} from '../../../styling/GlobalGrid';
import {
  baseColor,
} from '../../../styling/styleUtils';
import PreChartRow from '../../../components/general/PreChartRow';
import ErrorBoundary from '../ErrorBoundary';
import styled from 'styled-components/macro';
import SimpleError from '../../transitionStateComponents/SimpleError';
import LoadingBlock, {LoadingOverlay} from '../../transitionStateComponents/VizLoadingBlock';
import useRCAData, {SuccessResponse} from '../industrySpace/chart/useRCAData';
import Industries from './Industries';
import Clusters from './Clusters';
import {
  ColorBy,
} from '../../../routing/routes';
import useFluent from '../../../hooks/useFluent';
import {ClusterLevel} from '../../../routing/routes';
import {Mode} from '../../general/searchIndustryInGraphDropdown';

const Root = styled.div`
  width: 100%;
  height: 100%;
  grid-column: 1;
  grid-row: 2;
  position: relative;
  display: grid;
  grid-template-rows: 1fr;
  grid-template-columns: 3.5rem 1fr;

  @media ${breakPoints.small} {
    grid-row: 3;
    grid-column: 1;
  }
`;

const LeftAxisRoot = styled.div`
  grid-row: 1;
  grid-column: 1;
  white-space: nowrap;
  display: flex;
  transform: rotate(-90deg);
  align-items: center;
  justify-content: center;
  pointer-events: none;
`;

const AxisLabelBase = styled.div`
  font-weight: 600;
  font-size: 0.875rem;
  color: ${baseColor};
  text-transform: uppercase;

  @media (max-height: 600px) {
    font-size: 0.65rem;
  }
`;

const AxisLabelHigh = styled(AxisLabelBase)`
  margin-left: 3rem;

  @media (max-height: 700px) {
    margin-left: 1rem;
  }
`;

const VizRoot = styled.div`
  width: 100%;
  height: 100%;
  position: relative;
  grid-column: 2;
  grid-row: 1;
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

interface Props {
  isClusterView: boolean;
  highlighted: string | undefined;
  setHighlighted: (value: string | undefined) => void;
  hiddenSectors: ClassificationNaicsIndustry['id'][];
  hiddenClusters: ClassificationNaicsCluster['id'][];
  clusterLevel: ClusterLevel;
  digitLevel: DigitLevel;
  colorBy: ColorBy;
}

const RCABarChart = (props: Props) => {
  const {
    hiddenSectors, setHighlighted,
    highlighted,
    isClusterView, clusterLevel,
    digitLevel, colorBy, hiddenClusters,
  } = props;
  const getString = useFluent();
  const industryMap = useGlobalIndustryMap();
  const windowDimensions = useWindowWidth();
  const {loading, error, data} = useRCAData(digitLevel);

  const rootRef = useRef<HTMLDivElement | null>(null);
  const [dimensions, setDimensions] = useState<{width: number, height: number} | undefined>(undefined);
  useEffect(() => {
    const node = rootRef.current;
    if (node) {
      const {width, height} = node.getBoundingClientRect();
      setDimensions({width, height});
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
    const clusterData = clusterLevel === ClusterLevel.C1 ? dataToUse.c1Rca : dataToUse.c3Rca;
    const industryData = dataToUse.naicsRca;
    const loadingOverlay = loading ? <LoadingBlock /> : null;
    const viz = isClusterView ? (
      <Clusters
        key={'ClustersRCAChart' + dimensions.height.toString() + dimensions.width.toString()}
        data={clusterData}
        clusterLevel={clusterLevel}
        colorBy={colorBy}
        hiddenClusters={hiddenClusters}
        highlighted={highlighted}
      />
    ) : (
      <Industries
        key={'IndustriesRCAChart' + dimensions.height.toString() + dimensions.width.toString()}
        data={industryData}
        highlighted={highlighted}
        hiddenSectors={hiddenSectors}
        colorBy={colorBy}
        digitLevel={digitLevel}
      />
    );
    output = (
      <VizContainer style={{height: dimensions.height}}>
          <ErrorBoundary>
            {viz}
          </ErrorBoundary>
        {loadingOverlay}
      </VizContainer>
    );
  } else {
    output = null;
  }

  return (
    <>
      <PreChartRow
        searchInGraphOptions={{
          hiddenParents: isClusterView ? hiddenClusters : hiddenSectors,
          digitLevel,
          clusterLevel,
          setHighlighted,
          mode: isClusterView ? Mode.cluster : Mode.naics,
        }}
        settingsOptions={{
          compositionType: true,
          clusterLevel: isClusterView ? true : undefined,
          digitLevel: isClusterView ? undefined : true,
          colorBy: true,
          aggregationMode: true,
        }}
      />
      <Root>
        <LeftAxisRoot>
          <AxisLabelBase>← {getString('global-intensity-lower')}</AxisLabelBase>
          <AxisLabelHigh>{getString('global-intensity-higher')} →</AxisLabelHigh>
        </LeftAxisRoot>
        <VizRoot ref={rootRef}>
          {output}
        </VizRoot>
      </Root>
    </>
  );
};

export default RCABarChart;