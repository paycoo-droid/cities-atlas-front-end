import React from 'react';
import styled from 'styled-components/macro';
import {rgba} from 'polished';
import {
  secondaryFont,
  primaryColor,
  primaryHoverColor,
} from '../../styling/styleUtils';
import {
  citiesLogoSVG,
  cityIconSVG,
} from '../../components/navigation/header';
import useFluent from '../../hooks/useFluent';
import GrowthLabLogoPNG from '../../assets/branding/growth-lab-logo.png';

const Root = styled.div`
  position: fixed;
  width: 100vw;
  height: 100vh;
  top: 0;
  left: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  pointer-events: none;
  z-index: 100;
`;

const Content = styled.div`
  padding: 1rem;
  background-color: ${rgba('#08111e', 0.9)};
  pointer-events: all;
  color: #fff;
  display: grid;
  grid-template-areas:
    "gl logo ."
    "questions questions questions"
    "paragraph paragraph paragraph"
    ". click ."
    "footer footer footer";
  grid-template-columns: 1fr auto 1fr;
  grid-row-gap: 1.5rem;
  max-width: 700px;
  max-height: 100%;
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

  a {
    color: ${primaryColor};

    &:hover {
      color: ${primaryHoverColor};
    }
  }

  @media (max-height: 700px) {
    max-width: 600px;
    grid-template-columns: 0 auto 0;
  }
`;

const GrowthLabLogo = styled.div`
  grid-area: gl;
  position: relative;

  img {
    width: 170px;
    max-width: 100%;
    min-width: 90px;
    @media (max-width: 600px) {
      position: absolute;
      min-width: 120px;
      top: -1rem;
    }
  }
`;

const CityverseLogo = styled.div`
  grid-area: logo;
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const Logo = styled.h1`
  margin: 3rem 3rem 0;
  width: 13.75rem;
  height: 3rem;

  svg {
    width: 100%;
    height: 100%;

    path {
      fill: #fff;
    }
  }
`;

const TitleSubtext = styled.h2`
  font-size: 0.875rem;
  margin: 0;
  font-weight: 400;
  text-transform: none;
`;

const IntroQuestions = styled.div`
  grid-area: questions;
  font-size: 0.875rem;
  line-height: 1.75;
  padding: 0 3rem 0;
  opacity: 0.8;

  @media (max-height: 700px) {
    padding: 0 0.875rem 0;
    font-size: 0.8rem;
  }
`;

const IntroP = styled.div`
  grid-area: paragraph;
  font-size: 0.875rem;
  line-height: 1.75;
  padding: 0 3rem 0.5rem;
  padding: 0 3rem clamp(0.5rem, 0.5vh, 2rem);
  opacity: 0.8;

  @media (max-height: 700px) {
    padding: 0 0.875rem 0.5rem;
    padding: 0 0.875rem clamp(0.5rem, 0.5vh, 2rem);
    font-size: 0.8rem;
  }
`;

const IntroFooter = styled.div`
  grid-area: footer;
  font-size: 0.875rem;
  line-height: 1.75;
  padding: 0 3rem 0.7rem;
  opacity: 0.8;

  @media (max-height: 700px) {
    padding: 0 0.875rem 0.7rem;
    font-size: 0.8rem;
  }
`;

const StartButtons = styled.div`
  grid-area: click;
  font-family: ${secondaryFont};
  font-size: 1.2rem;
  text-transform: uppercase;
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;

  @media (max-height: 700px) {
    font-size: 0.9rem;
  }
`;

const PickCityButton = styled.button`
  font-family: ${secondaryFont};
  font-size: 1.2rem;
  text-transform: uppercase;
  color: #fff;
  border: solid 1px #fff;
  background-color: transparent;
  padding: 0.875rem;
  margin: 1.25rem 0 0.75rem;
  margin: 1.25rem 0 clamp(0.75rem, 1vh, 3rem);
  display: flex;
  align-items: center;

  svg {
    width: 100%;
    height: 100%;

    path,
    rect {
      fill: #fff;
    }
  }

  &:hover {
    cursor: pointer;
    color: #08111e;
    background-color: #fff;

    svg {
      path,
      rect {
        fill: #08111e;
      }
    }
  }

  @media (max-height: 700px) {
    font-size: 0.9rem;
    margin: 0.875rem 0 0.75rem;
    padding: 0.65rem;
  }
`;

const CityIcon = styled.div`
  width: 2rem;
  height: 2rem;
  margin-right: 0.45rem;
`;

interface Props {
  onCitySelect: () => void;
}

const Overlay = ({onCitySelect}: Props) => {
  const getString = useFluent();

  return (
    <Root>
      <Content>
        <GrowthLabLogo>
          <a
            href='https://growthlab.cid.harvard.edu/'
            target='_blank'
            rel='noopener noreferrer'
          >
            <img
              src={GrowthLabLogoPNG}
              aria-label={'The Growth at Lab at the Center for International Development at the Harvard Kennedy School'}
              title={'The Growth at Lab at the Center for International Development at the Harvard Kennedy School'}
              alt={'The Growth at Lab at the Center for International Development at the Harvard Kennedy School'}
            />
          </a>
        </GrowthLabLogo>
        <CityverseLogo>
          <Logo
            dangerouslySetInnerHTML={{__html: citiesLogoSVG}}
            aria-label={getString('global-app-name')}
          />
          <TitleSubtext>
            {getString('landing-overlay-subtitle')}
          </TitleSubtext>
        </CityverseLogo>
        <IntroQuestions dangerouslySetInnerHTML={{__html: getString('landing-overlay-questions')}} />
        <IntroP>{getString('landing-overlay-p1')}</IntroP>
        <StartButtons>
          To Start
          <PickCityButton onClick={onCitySelect}>
            <CityIcon
              dangerouslySetInnerHTML={{__html: cityIconSVG}}
            />
            Pick a city
          </PickCityButton>
        </StartButtons>
        <IntroFooter dangerouslySetInnerHTML={{__html: getString('landing-overlay-footnote')}} />
      </Content>
    </Root>
  );
};

export default Overlay;
