import { useEffect, useState } from "react";
import {
  Routes,
  Route,
  useLocation,
  useParams,
  Outlet,
  Link,
  useMatch,
  Router,
} from "react-router-dom";
import styled from "styled-components";
import ApexChart from "react-apexcharts";
import Finance from "./Finance";
import Article from "./Article";
import { atom, useRecoilState } from "recoil";
import Trend from "./Trend";

const StyledButton = styled.button`
  padding: 6px 12px;
  border-radius: 8px;
  font-size: 1rem;
  line-height: 1.5;
  border: 1px solid lightgray;
  color: gray;
  background: white;
`;

const Container = styled.div`
  padding: 0px 20px;
  max-width: 1000px;
  margin: 0 auto;
`;

const Loader = styled.span`
  text-align: center;
  display: block;
`;

const Title = styled.h1`
  color: ${(props) => props.theme.accentColor};
  font-size: 50px;
`;

const Header = styled.header`
  height: 10vh;
  display: flex;
  justify-content: center;
  align-items: center;
`;

const Overview = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  background-color:white;
  padding: 10px 20px;
  border-radius: 10px;
`;
const OverviewItem = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  span:first-child {
    font-size: 10px;
    font-weight: 400;
    text-transform: uppercase;
    margin-bottom: 5px;
  }
`;
const Tabs = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  margin: 25px 0px;
  gap: 10px;
`;

const Tab = styled.span`
  text-align: center;
  text-transform: uppercase;
  font-size: 12px;
  font-weight: 400;
  background-color: white;
  padding: 7px 0px;
  border-radius: 10px;
  color: ${(props) =>
    props.isActive ? props.theme.accentColor : props.theme.textColor};
  a {
    display: block;
  }
`;

const Description = styled.p`
  margin: 20px 0px;
`;
export const stockCode= atom({
  key:'stockCode',
  default:''
})
function Info() {
  const { stockId } = useParams();
  const [code,setCode]=useRecoilState(stockCode);
  setCode(stockId);
  console.log(code);
  const { state } = useLocation();
  console.log(useLocation());
  const name = state.name;
  const [loading, setLoading] = useState(true);
  const [stockData, setstockData] = useState([{}]); //날짜별 가격
  const [updown, setUpdown] = useState([[]]);
  const [relate, setRelate] = useState([]);
  const [predict,setPredict]=useState([{}]); //예측가격
  const articleMatch = useMatch("/:stockId/article");
  const financeMatch = useMatch("/:stockId/finance");

  useEffect(() => {
    // 종목 가격 불러오기 1.날짜 2.시가 3.고가 4.저가 5.종가
    fetch(`/api/info/${stockId}`)
      .then((res) => res.json())
      .then((data) => {
        setstockData(data.data);
      });
    // 연관기업코드
    (async () => {
      const updownResponse = await fetch(`/api/up_down/${stockId}`);
      const updownJson = await updownResponse.json();
      const predResponse = await fetch(`/api/cnn/${stockId}`);
      const predJson = await predResponse.json();
      setPredict(predJson.data)
      setUpdown(updownJson.data);
      setLoading(false);
    })();
  }, []);
  console.log(relate);
  console.log(stockData);
  console.log(predict);
  // const isUp = updown[0][0].substr(0, 3);
  // console.log(isUp);
  return (
    <Container>
      <Link to="/">
        <StyledButton>Home</StyledButton>
      </Link>
      <Header>
        <Title>{name}</Title>
      </Header>
      {loading ? (
        <Loader>loading...</Loader>
      ) : (
        <>
          <Overview>
            <OverviewItem>
              <span>종목코드:</span>
              <span>{stockId}</span>
            </OverviewItem>
            <OverviewItem>
              <span>현재가:</span>
              {/* 최신날짜 종가 */}
              <span>{stockData[stockData.length - 1].종가}</span>
              <span>
                {updown[0][0].substr(0, 2) === "상향" ? (
                  <p style={{ color: "red" }}> +{updown[0][0].substr(3)}</p>
                ) : (
                  <p style={{ color: "blue" }}> -{updown[0][0].substr(3)}</p>
                )}
              </span>
              <span>
                {updown[0][0].substr(0, 2) === "상향" ? (
                  <p style={{ color: "red" }}> {updown[1][0].substr(3)}</p>
                ) : (
                  <p style={{ color: "blue" }}> {updown[1][0].substr(3)}</p>
                )}
              </span>
            </OverviewItem>
          </Overview>

          <div>
            <ApexChart
              type="line"
              series={[
                {
                  name: "sales",
                  data: stockData?.map((price) => price.종가),
                },
                {
                  name: "predict",
                  data: predict?.map((price)=>price)
                }
              ]}
              options={{
                theme: {
                  mode:"light"
                },
                chart: {
                  toolbar: {
                    show: false,
                  },
                  height: 500,
                },
                grid: {
                  show: true,
                },
                stroke: {
                  curve: "smooth",
                  width: 3,
                },
                xaxis: {
                  type: "datetime",
                  categories: stockData?.map((price) => price.날짜),
                  labels: {
                    style: {
                      colors: "#9c88ff",
                    },
                  },
                },
              }}
            />
          </div>
          <Tabs>
            <Tab isActive={financeMatch !== null}>
              <Link to="finance" state={{ name }}>
                finance
              </Link>
            </Tab>
            <Tab isActive={articleMatch !== null}>
              <Link to="article" state={{ name }}>
                Article
              </Link>
            </Tab>
          </Tabs>
          <Outlet />
        </>
      )}
      <Trend/>
    </Container>
  );
}
export default Info;
