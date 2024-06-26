import React, { useEffect, useState } from "react";
import styles from "./teamManage.module.css";
import LeftSide from "../components/teamComponents/LeftSide";
import { useSetRecoilState } from "recoil";
import { categoryState } from "../atoms";
import { useNavigate, useParams } from "react-router-dom";
import {
  getManage,
  sendKick,
  sendPlusMatching,
  sendRun,
  sendVote,
} from "../api/team";

import ErrorComponent from "../components/ErrorComponent";

const role = ["프론트엔드", "백엔드", "디자인", "기획"];

const FieldSelection = ({ onSelect }) => {
  const [selectedField, setSelectedField] = useState("분야 선택");
  const [view, setView] = useState(false);

  const handleItemClick = (role) => {
    setSelectedField(role);
    setView(false);
    onSelect(role);
  };

  useEffect(() => {
    console.log("useEffect:", selectedField);
  }, [selectedField]);

  const toggleView = () => {
    setView(!view); // 선택 창을 열거나 닫습니다.
  };

  return (
    <div className={styles.flex}>
      <ul onClick={toggleView}>
        <div className={styles.select}>
          <span>{selectedField}</span> <span>{view ? "∧" : "∨"}</span>
        </div>
        {view && (
          <ul className={styles.numSelect}>
            {role.map((role, index) => (
              <li
                key={index}
                onClick={() => handleItemClick(role)}
                className={styles.text}
              >
                {role}
              </li>
            ))}
          </ul>
        )}
      </ul>
    </div>
  );
};

/*const MemberSelection = ({ onSelect, length }) => {
  const [findNum, setFindNum] = useState("인원 선택");
  const [view, setView] = useState(false);

  const handleItemClick = (item) => {
    setFindNum(item);
    setView(false);
    onSelect(item);
  };

  useEffect(() => {
    console.log("[매칭인원]:", findNum);
  }, [findNum]);

  const toggleView = () => {
    setView(!view); // 선택 창을 열거나 닫습니다.
  };
  const numberList = Array.from({ length: length }, (_, index) => index + 1);

  return (
    <div className={styles.flex}>
      <ul onClick={toggleView}>
        <div className={styles.select}>
          <span>{findNum}</span> <span>{view ? "∧" : "∨"}</span>
        </div>
        {view && (
          <ul className={styles.numSelect}>
            {numberList.map((number, index) => (
              <li
                key={index}
                onClick={() => handleItemClick(number)}
                className={styles.text}
              >
                {number}
              </li>
            ))}
          </ul>
        )}
      </ul>
    </div>
  );
};*/

/* 메인 */

const TeamManage = () => {
  const setCategoryState = useSetRecoilState(categoryState); // Recoil 상태를 업데이트하는 함수 가져오기
  const { tid } = useParams();
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [memberInfo, setMemberInfo] = useState([]);
  const [filterMemberInfo, setFilterMemberInfo] = useState([]);
  const [endAgree, setEndAgree] = useState();
  const [leaderId, setLeaderId] = useState();
  const [isLeader, setIsLeader] = useState();
  const [id, setId] = useState();
  const [user, setUser] = useState();
  const navigate = useNavigate(); // useNavigate hook 추가

  useEffect(() => {
    const fetchReportInfo = async () => {
      setCategoryState(1);
      setIsLoading(true);

      try {
        const responseGet = await getManage(tid);
        console.log("[Response]: ", responseGet.data);
        setMemberInfo(responseGet.data.memberList);
        if (responseGet.data) {
          const filterInfo = responseGet.data.memberList.filter((list) => {
            return list.id.toString() !== localStorage.userId; // 본인은 제외
          });

          setFilterMemberInfo(filterInfo);
        }
        setEndAgree(responseGet.data.endVote);
        setLeaderId(responseGet.data.leader);
        setId(localStorage.userId);
        setUser(localStorage.userId);
        /*const memberIds = responseGet.data.memberList.map(
          (member) => member.id
        );*/
        console.log("[leader id]: ", responseGet.data.leader);
        console.log("[leader id type]: ", typeof responseGet.data.leader);
        console.log("[local id type]: ", typeof localStorage.userId);

        console.log(
          "[isleader?]: ",
          responseGet.data.leader === Number(localStorage.userId)
        );
        setIsLeader(leaderId === Number(localStorage.userId));
      } catch (error) {
        setIsError(true);
        setErrorMessage("활동종료 기본정보를 불러오는 중 오류가 발생했습니다.");
        console.error("Error fetching teamManage(end) detail: ", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchReportInfo();
  }, [tid, setCategoryState, leaderId, isLeader, id, user]);

  /*const memberIds = memberInfo.map((member) => member.id);*/

  const [inputList, setInputList] = useState([
    { id: 1, role: "", recruitNum: "" },
  ]);
  const [reason, setReason] = useState("");

  //const [selectedMember, setSelectedMember] = useState("팀원 선택");
  const [selectedItem, setSelectedItem] = useState({
    id: null,
    nickname: "팀원 선택",
  });

  const [view, setView] = useState(false);

  const reasonChange = (event) => {
    setReason(event.target.value);
    console.log(event.target.value);
  };

  const memClick = (item) => {
    console.log("memclick", item);
    setSelectedItem(item);
  };

  useEffect(() => {
    console.log("[input]: ", selectedItem);
  }, [selectedItem]);

  const addInputList = () => {
    const newId = inputList.length + 1;
    setInputList([...inputList, { id: newId, role: "", recruitNum: "" }]);
  };

  const handleFieldChange = (id, value) => {
    setInputList(
      inputList.map((input) =>
        input.id === id ? { ...input, role: value } : input
      )
    );
  };

  const handleNumChange = (id, value) => {
    value = parseInt(value, 10); //입력한 값을 10진수의 정수로 변경
    console.log(value);

    setInputList(
      inputList.map((input) =>
        input.id === id ? { ...input, recruitNum: value } : input
      )
    );
  };

  useEffect(() => {
    console.log("[inputs]:", inputList);
  }, [inputList]);

  /*post api*/
  const vote = () => {
    console.log("[user]:", user);
    alert("종료 투표가 완료되었습니다");
    navigate(`/`); //완료시 메인 화면으로
    setCategoryState(0);

    try {
      const responseVote = sendVote(tid, user);
      console.log("[vote]:", responseVote);
      console.log("tid: ", tid);
      console.log("id: ", user);
      console.log("종료 투표!");
    } catch (error) {
      console.error("Error sending vote:", error);
    }
  };

  const plusmatching = async () => {
    try {
      console.log("inputList: ", inputList);
      const sendList = inputList.map((content) => ({
        role: content.role,
        recruitNum: content.recruitNum,
      }));
      console.log("[SendList]:", sendList);

      const hasIncompleteFields = sendList.some((content) => {
        return content.role === "" || content.recruitNum === "";
      });
      // 추가 인원의 역할이나 인원 중 채우지 않은 필드 있는지 확인

      if (hasIncompleteFields) alert("모든 필드를 채워주세요");
      else {
        const responsePlusMatching = await sendPlusMatching(tid, sendList);
        console.log("[PlusMatching]:", responsePlusMatching);
        console.log(
          "[insufficient]:",
          responsePlusMatching.data.insufficient_roles
        );
        if (responsePlusMatching.data.insufficient_roles != null)
          alert(
            "추가 매칭 실패한 분야: " +
              responsePlusMatching.data.insufficient_roles
          );
        else alert("추가 매칭 성공했습니다");
      }
    } catch (error) {
      console.error("Error sending plusMatching:", error);
    }
  };

  const kick = async () => {
    try {
      if (selectedItem.id == null) alert("퇴출 인원을 선택해주세요");
      else if (reason == "") alert("퇴출 사유를 입력해주세요");
      else if (!checked) {
        alert("체크박스에 동의해야 퇴출이 가능합니다.");
        return;
      } else {
        alert("퇴출이 완료됐습니다.");
        navigate(`/`); //완료시 메인 화면으로
      }
      console.log("퇴출 대상: ", selectedItem);
      console.log("퇴출 이유: ", reason);

      const responseKick = await sendKick(tid, selectedItem.id, reason);
      console.log("[kick]:", responseKick);
      console.log("[tid]:", tid);
      console.log("[id]:", selectedItem.id);
      console.log("[reason]:", reason);
    } catch (responseError) {
      if (responseError.response && responseError.response.status === 400) {
      }
    }
  };

  const runChange = (event) => {
    setReason(event.target.value);
    console.log(event.target.value);
  };

  const run = async () => {
    try {
      if (reason == "") alert("하차 사유를 입력해주세요");
      else if (!checked) {
        alert("체크박스에 동의해야 하차가 가능합니다");
        return;
      } else {
        alert("하차가 완료됐습니다.");
        navigate("/"); //완료시 메인페이지로
      }
      console.log("하차 이유: ", reason);
      const responseRun = await sendRun(tid, user, reason);
      console.log("[run]:", responseRun);
      console.log("[tid]:", tid);
      console.log("[user]:", user);
      console.log("[reason]:", reason);
    } catch (responseError) {
      if (responseError.response && responseError.response.status === 400) {
      }
    }
  };

  const [checked, setchecked] = useState();
  const checkboxClick = (event) => {
    setchecked(event.target.checked);
  };
  return (
    <div className={styles.container}>
      <div className={styles.left}>
        <LeftSide />
      </div>
      {isLoading ? (
        <div>Loading...</div>
      ) : isError ? (
        <ErrorComponent message={errorMessage} />
      ) : (
        <div className={styles.main}>
          {isLeader ? (
            <div>
              <h2 className={styles.title}>활동 종료</h2>
              <hr className={styles.line} />
              <h4>
                ⨳ 활동 종료는 과반수 이상의 팀원이 종료 여부에 이상이 없음을
                확인하고 찬성 시 팀장의 확인 하에 가능합니다.
              </h4>
              <div className={styles.box}>
                <div className={styles.agreeTitle}>현재 찬성 인원</div>
                <div className={styles.agreeDetail}>
                  {endAgree} / {memberInfo.length}
                </div>
              </div>
              <div className={styles.btnCtn}>
                <button onClick={vote} className={styles.btn}>
                  팀 활동 종료
                </button>
              </div>
              <h2 className={styles.title}>추가 매칭 신청</h2>
              <hr className={styles.line} />
              <h3>모집 인원 및 모집 분야 입력</h3>
              <div>
                {inputList.map((input) => (
                  <div className={styles.matching} key={input.id}>
                    <button className={styles.plusbtn} onClick={addInputList}>
                      +
                    </button>
                    <FieldSelection
                      onSelect={(item) => handleFieldChange(input.id, item)}
                    />
                    {/*<MemberSelection
                      onSelect={(item) => handleNumChange(input.id, item)}
                      length={memberInfo.length}
                />*/}

                    <input
                      type="number"
                      placeholder="모집 인원 입력"
                      className={styles.inputField}
                      onChange={(e) =>
                        handleNumChange(input.id, e.target.value)
                      }
                    />
                    {/*인원을 직접 입력하도록 변경 */}
                  </div>
                ))}
              </div>
              <div className={styles.btnCtn}>
                <button onClick={plusmatching} className={styles.btn}>
                  추가 매칭 신청
                </button>
              </div>
              <h2 className={styles.title}>팀원 강제 퇴출</h2>
              <hr className={styles.line} />
              <div>
                <ul
                  className={styles.listt}
                  onClick={() => {
                    setView(!view);
                  }}
                >
                  <div>
                    <div className={styles.select}>
                      <span>{selectedItem.nickname}</span>
                      <span>{view ? "∧" : "∨"}</span>
                    </div>
                  </div>

                  {view && (
                    <ul className={styles.listt}>
                      {filterMemberInfo.map((content, index) => (
                        <li
                          className={styles.text}
                          key={index}
                          onClick={() => memClick(content)}
                        >
                          {content.nickname}
                        </li>
                      ))}
                    </ul>
                  )}
                </ul>
              </div>
              <textarea
                className={styles.kickReason}
                placeholder="팀원 강제 퇴출 사유를 입력해주세요."
                onChange={reasonChange}
              />
              <div className={styles.checkbox}>
                <input
                  id="checkbox"
                  type="checkbox"
                  checked={checked}
                  onClick={checkboxClick}
                />
                <label htmlFor="checkbox"></label>
                불공정한 사유로 팀원을 강제 퇴출할 경우 불이익이 있을 수 있음을
                확인하였으며, 위의 내용에 대해 동의합니다.
              </div>

              <div className={styles.btnCtn}>
                <button onClick={kick} className={styles.btn}>
                  강제 퇴출
                </button>
              </div>
            </div>
          ) : (
            <div>
              <h2 className={styles.title}>활동 종료</h2>
              <hr className={styles.line} />
              <h4>
                ⨳ 활동 종료는 과반수 이상의 팀원이 종료 여부에 이상이 없음을
                확인하고 찬성 시 팀장의 확인 하에 가능합니다.
              </h4>
              <div className={styles.box}>
                <div className={styles.agreeTitle}>현재 찬성 인원</div>
                <div className={styles.agreeDetail}>
                  {endAgree} / {memberInfo.length}
                </div>
              </div>
              <div className={styles.btnCtn}>
                <button onClick={vote} className={styles.btn}>
                  팀 활동 종료
                </button>
              </div>
              <h2 className={styles.title}>중도 하차</h2>
              <hr className={styles.line} />
              <textarea
                className={styles.box2}
                placeholder="중도 하차 사유를 입력해주세요."
                onChange={runChange}
              />
              <div className={styles.checkbox}>
                <input
                  id="checkbox"
                  type="checkbox"
                  checked={checked}
                  onClick={checkboxClick}
                />
                <label htmlFor="checkbox"></label>
                중도 하차할 경우 불이익이 있을 수 있음을 확인하였으며, 위의
                내용에 대해 동의합니다.
              </div>
              <div className={styles.btnCtn}>
                <button onClick={() => run()} className={styles.btn}>
                  중도 하차
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default TeamManage;
