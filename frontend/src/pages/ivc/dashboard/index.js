/* eslint-disable react/prop-types */
import React, {useState, useCallback, useEffect} from 'react';
import dropDown from 'assets/images/dropdown---1.5Expanded.svg';
import {Bar} from 'react-chartjs-2';

import {PieChart, Pie, Cell, Sector} from 'recharts';
import {Flex, Text, useToast, Spinner} from '@chakra-ui/react';
import AssessmentChart from './component/assessment-chart';
import ProgressChart from './component/progress-chart';
import {useSelector} from 'react-redux';
import {request} from 'common';
import {nanoid} from '@reduxjs/toolkit';

/**
 * Dashboard component displays company SAT/IEG/Product Testing scores, progress charts, and assessment comparisons.
 *
 * @returns {JSX.Element} Dashboard UI with performance visualizations and selectable assessment data.
 */
const Dashboard = () => {
  const toast = useToast();
  const [testing, setTesting] = useState('Flour');
  const [loading, setLoading] = useState(true);
  const [scores, setScores] = useState([]);
  const user = useSelector((state) => state.auth.user);
  const [activeIndex, setActiveIndex] = useState(0);

  /**
   * Handles pie chart segment hover to set active slice.
   *
   * @param {object} _ - The event object (unused).
   * @param {number} index - Index of the hovered pie slice.
   */
  const onPieEnter = useCallback(
    (_, index) => {
      setActiveIndex(index);
    },
    [setActiveIndex]
  );
  const data = [
    {name: 'Group B', value: 83, color: '#04B279'},
    {name: 'Group A', value: 17, color: '#f8f8fa'},
  ];

  /**
   * Fetches test scores for the logged-in user's company.
   * Sorts results by `sort_order` and updates state.
   * Displays an error toast if request fails.
   *
   * @returns {Promise<void>}
   */
  const getTestScores = async () => {
    try {
      // API call to fetch scores for user's company
      const {
        data: {data: res},
      } = await request(true).get(`/sat/scores?company-id=${user.company.id}`);
      // Sort scores by display order
      setScores(res.sort((a, b) => a.sort_order - b.sort_order));
      // Stop loading spinner
      setLoading(false);
    } catch (error) {
      // Stop loading spinner
      setLoading(false);
      // Display error message toast on failure
      return toast({
        status: 'error',
        title: 'Error',
        position: 'top-right',
        description: 'Something went wrong',
        duration: 6000,
        isClosable: true,
      });
    }
  };

  useEffect(() => {
    getTestScores();
  }, [user]);

  const options = {
    scales: {
      y: {
        max: 100,
        ticks: {
          // Include a percentage sign in the ticks
          callback: function (value) {
            return value + '%';
          },
        },
      },
    },
  };

  /**
   * Custom rendering function for the active shape in the pie chart.
   *
   * @param {object} props - Pie sector properties.
   * @param {number} props.cx - X coordinate of pie center.
   * @param {number} props.cy - Y coordinate of pie center.
   * @param {number} props.innerRadius - Inner radius of the pie.
   * @param {number} props.outerRadius - Outer radius of the pie.
   * @param {number} props.startAngle - Start angle of the slice.
   * @param {number} props.endAngle - End angle of the slice.
   * @param {string} props.fill - Color of the slice.
   * @param {number} props.percent - Percentage value of the slice.
   * @returns {JSX.Element} Rendered sector with label.
   */
  const renderActiveShape = (props) => {
    const {cx, cy, innerRadius, outerRadius, startAngle, endAngle, fill, percent} = props;
    return (
      <>
        <text
          x={cx}
          y={cy}
          dy={8}
          textAnchor="middle"
          style={{fontSize: 44, fontWeight: '700'}}
          fill={'#000'}
        >
          {`${percent * 100}%`}
        </text>
        <Sector
          cx={cx}
          cy={cy}
          innerRadius={innerRadius}
          outerRadius={outerRadius}
          startAngle={startAngle}
          endAngle={endAngle}
          fill={fill}
        />
      </>
    );
  };

  return loading ? (
    <Flex height="100%" width="100%" mb="10" justifyContent="center" alignItems="center">
      <Spinner />
    </Flex>
  ) : (
    <div className="padding-0 background-color-4 w-col w-col-10" style={{width: '100%'}}>
      <div className="background-color-white padding-x-10 padding-y-6 border-bottom-1px sticky-top-0 flex-row-middle flex-space-between">
        <h5 className="page-title">Dashboard</h5>
        <a className="flex-row-middle padding-x-4 padding-y-2 background-brand rounded-large text-color-4 no-underline w-inline-block">
          <div className="padding-right-2 text-small text-color-4">Download</div>
          <img src={dropDown} loading="lazy" alt="" />
        </a>
      </div>
      <div className="padding-10">
        <div className="flex-row-middle flex-space-between margin-bottom-10">
          <div>
            <Text className="margin-bottom-1 weight-medium" fontSize="25px" fontWeight="700">
              2021 Cycle
            </Text>
            <div className="text-small text-color-body-text weight-medium">
              July 2021 - August 2021
            </div>
          </div>
          <div className="flex-row-middle">
            <div className="margin-right-4 text-small text-color-body-text">Compare with</div>
            <div className="width-auto margin-bottom-0 w-form">
              <form
                id="email-form"
                name="email-form"
                data-name="Email Form"
                className="flex-row-middle"
              >
                <select
                  id="field-2"
                  name="field-2"
                  data-name="Field 2"
                  className="border-1px rounded-large background-color-4 margin-bottom-0 w-select"
                >
                  <option value="Alpha Assessment">Alpha Assessment</option>
                  <option value="Beta Assessment">Beta Assessment</option>
                </select>
              </form>
              <div className="w-form-done">
                <div>Thank you! Your submission has been received!</div>
              </div>
              <div className="w-form-fail">
                <div>Oops! Something went wrong while submitting the form.</div>
              </div>
            </div>
          </div>
        </div>
        <div>
          <Flex flexDirection="row" flexWrap="wrap">
            {scores.map((val) => (
              <Flex
                className="background-color-white border-1px rounded-large padding-5"
                key={nanoid()}
                flexDirection="column"
                width="340px"
                m={3}
              >
                <Text className="margin-bottom-1 weight-medium" fontSize="18px" fontWeight="700">
                  {val.score_type === 'SAT'
                    ? 'Self Assessment Scores'
                    : val.score_type === 'IEG'
                      ? 'Industry Expert Group'
                      : 'Product Testing'}
                </Text>
                <Text className="margin-bottom-2 weight-medium" fontSize="44px" fontWeight="700">
                  {val.value}%
                </Text>
                <div className="text-small margin-bottom-5">
                  <span className="text-color-green">+23.12%</span> From Alpha Assessment
                </div>
                <ProgressChart size={Number(val.value)} range={0} />
                <div className="flex-row-middle margin-top-4">
                  <div className="flex-row-middle">
                    <div className="width-5 height-2 background-color-blue-light rounded-small"></div>
                    <div className="text-xs margin-left-2 text-color-1">Current Assessment</div>
                  </div>
                  <div className="flex-row-middle margin-left-4">
                    <div className="width-5 height-2 background-color-blue radius-small"></div>
                    <div className="text-xs margin-left-2 text-color-1">Previous Assessment</div>
                  </div>
                </div>
              </Flex>
            ))}
          </Flex>
          <Text
            className="margin-bottom-2 weight-medium margin-top-8"
            fontSize="18px"
            fontWeight="700"
          >
            Overview
          </Text>
          <div className="w-layout-grid grid-2-columns right-2---1 margin-top-5">
            <div className="background-color-white border-1px rounded-large padding-5">
              <Text className="margin-bottom-5 weight-medium" fontSize="15px" fontWeight="700">
                Overall Weighted Score
              </Text>
              <div className="width-full flex-justify-center margin-top-10">
                <PieChart width={300} height={300}>
                  <Pie
                    activeIndex={activeIndex}
                    activeShape={renderActiveShape}
                    cx="50%"
                    cy="50%"
                    data={data}
                    innerRadius={110}
                    outerRadius={135}
                    dataKey="value"
                    onMouseEnter={onPieEnter}
                  >
                    {data.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                </PieChart>
              </div>
            </div>
            <div className="background-color-white border-1px rounded-large padding-5">
              <div className="flex-space-between margin-bottom-5">
                <Text className="margin-bottom-5 weight-medium" fontSize="15px" fontWeight="700">
                  Assessment Scores
                </Text>
              </div>
              <div className="width-full flex-justify-start" style={{maxWidth: 650}}>
                {/* Render horizontal bar chart of all scores */}
                <Bar
                  data={
                    scores.length > 0 && {
                      labels: scores.map((val) =>
                        val.score_type === 'SAT'
                          ? 'Self Assessment Scores'
                          : val.score_type === 'IEG'
                            ? 'Industry Expert Group'
                            : 'Product Testing'
                      ),
                      datasets: [
                        {
                          label: 'scores',
                          data: scores.map((val) => Number(val.value)),
                          backgroundColor: 'rgba(82, 108, 219, 1)',
                          borderColor: 'rgba(82, 108, 219, 1)',
                          borderWidth: 1,
                          barThickness: 37,
                          minBarLength: 2,
                          barPercentage: 5.0,
                        },
                      ],
                    }
                  }
                  options={options}
                />
              </div>
            </div>
          </div>
          <div className="margin-top-5 background-color-white radius-large padding-5 border-1px">
            <div>
              <Text className="margin-bottom-5 weight-medium" fontSize="15px" fontWeight="700">
                Self Assessment Scores
              </Text>
            </div>
            <AssessmentChart />
          </div>
          <div className="margin-top-5 background-color-white radius-large padding-5 border-1px">
            <div>
              <Text className="margin-bottom-5 weight-medium" fontSize="15px" fontWeight="700">
                Industry Expert Group Scores
              </Text>
            </div>
            <AssessmentChart />
          </div>
          <div className="margin-top-5 background-color-white radius-large padding-5 border-1px">
            <div className="flex-space-between">
              <div>
                <Text className="margin-bottom-5 weight-medium" fontSize="15px" fontWeight="700">
                  Product Testing ({testing})
                </Text>
                <div className="text-small text-color-body-text margin-top-2">
                  Company scores are compared with the average industry score
                </div>
              </div>
              <div className="width-auto w-form">
                <form
                  id="email-form"
                  name="email-form"
                  data-name="Email Form"
                  className="flex-row-middle"
                >
                  <select
                    id="field-2"
                    name="field-2"
                    onChange={(e) => setTesting(e.target.value)}
                    data-name="Field 2"
                    className="border-1px rounded-large background-color-white w-select"
                  >
                    <option value="Flour">Flour</option>
                    <option value="Oil">Oil</option>
                    <option value="Sugar">Sugar</option>
                  </select>
                </form>
                <div className="w-form-done">
                  <div>Thank you! Your submission has been received!</div>
                </div>
                <div className="w-form-fail">
                  <div>Oops! Something went wrong while submitting the form.</div>
                </div>
              </div>
            </div>
            <AssessmentChart />
          </div>
        </div>
        <div className="border-top-1px margin-top-10 padding-top-5 flex-space-between">
          <div className="text-xs text-color-body-text">© Copyright MFI. All rights reserved</div>
          <div className="text-xs text-color-body-text">Powered by <a href=" https://www.technoserve.org/" target="_blank">TechnoServe</a></div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
