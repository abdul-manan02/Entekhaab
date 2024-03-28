// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract EVoting {
    address public admin;
    uint256 public startTime;
    uint256 public endTime;
    address[] public voters; // Array to store addresses of voters

    enum Party {PMLN, PTI, PPP, JUI}
    mapping(address => Party) public votes;
    mapping(string => uint256) public voteCounts;
    mapping(address => uint256) public ages;
    mapping(address => string) public maritalStatuses;
    mapping(address => string) public genders;
    mapping(address => uint256) public DOBs;
    mapping(address => string) public constituencies;
    mapping(address => string) public candidateNames; // Mapping to store candidate names

    event VoteCast(address indexed voter, string party, string candidateName); // Updated event definition
    event WinnerDeclared(string winner, uint256 votes);

    modifier onlyAdmin() {
        require(msg.sender == admin, "Only admin can call this function");
        _;
    }

    modifier onlyDuringVotingPeriod() {
        require(
            block.timestamp >= startTime && block.timestamp <= endTime,
            "Voting is not allowed at this time"
        );
        _;
    }

    struct VoteData {
        address voter;
        string party;
        string candidateName; // Added candidateName field to the struct
        uint256 age;
        string maritalStatus;
        string gender;
        uint256 DOB;
        string constituency;
    }

    constructor() {
        admin = msg.sender;
    }

    function startElection() external onlyAdmin {
        startTime = block.timestamp;
        endTime = startTime + 30 minutes;
    }

    function vote(string memory _party, string memory _candidateName, uint256 _age, string memory _maritalStatus, string memory _gender, uint256 _DOB, string memory _constituency)
        external
        onlyDuringVotingPeriod
    {
        votes[msg.sender] = parseParty(_party);
        voteCounts[_party]++;
        ages[msg.sender] = _age;
        maritalStatuses[msg.sender] = _maritalStatus;
        genders[msg.sender] = _gender;
        DOBs[msg.sender] = _DOB;
        constituencies[msg.sender] = _constituency;
        candidateNames[msg.sender] = _candidateName; // Store candidate name
        voters.push(msg.sender);
        emit VoteCast(msg.sender, _party, _candidateName); // Emit event with candidate name
    }

    function parseParty(string memory _party) internal pure returns (Party) {
        if (compareStrings(_party, "PMLN")) return Party.PMLN;
        else if (compareStrings(_party, "PTI")) return Party.PTI;
        else if (compareStrings(_party, "PPP")) return Party.PPP;
        else if (compareStrings(_party, "JUI")) return Party.JUI;
        else revert("Invalid party name");
    }

    function compareStrings(string memory a, string memory b) internal pure returns (bool) {
        return (keccak256(abi.encodePacked((a))) == keccak256(abi.encodePacked((b))));
    }

     function getWinnerParty() external view returns (string memory) {
        //require(block.timestamp > endTime, "Voting is still ongoing");
        string memory winner = "";
        uint256 maxVotes = 0;
        for (uint8 i = 0; i < 4; i++) {
            string memory party = getPartyName(Party(i));
            if (voteCounts[party] > maxVotes) {
                maxVotes = voteCounts[party];
                winner = party;
            }
        }
        return winner;
    }

    function getAllVotes() external view returns (VoteData[] memory) {
        uint256 index = 0;
        
        // Determine the length of the array
        for (uint256 i = 0; i < voters.length; i++) {
            if (votes[voters[i]] != Party(0)) {
                index++;
            }
        }
        
        // Initialize the array with the correct length
        VoteData[] memory voteDataArray = new VoteData[](index);
        
        // Populate the array with vote data
        index = 0;
        for (uint256 i = 0; i < voters.length; i++) {
            address voter = voters[i];
            Party party = votes[voter];

            if (party != Party(0)) {
                voteDataArray[index] = VoteData(
                    voter,
                    getPartyName(party),
                    candidateNames[voter], // Retrieve candidate name
                    ages[voter],
                    maritalStatuses[voter],
                    genders[voter],
                    DOBs[voter],
                    constituencies[voter]
                );
                index++;
            }
        }

        return voteDataArray;
    }

     function getPartyName(Party _party) internal pure returns (string memory) {
        if (_party == Party.PMLN) return "PMLN";
        else if (_party == Party.PTI) return "PTI";
        else if (_party == Party.PPP) return "PPP";
        else if (_party == Party.JUI) return "JUI";
        else return "Unknown";
    }
}