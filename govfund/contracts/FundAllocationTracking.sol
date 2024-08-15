// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract FundAllocationTracking {

    struct Department {
        string name;
        uint256[] projectIds;
    }

    struct Project {
        string name;
        uint256 allocatedFunds;
        uint256 utilizedFunds;
    }

    mapping(uint256 => Department) public departments;
    mapping(uint256 => Project) public projects;
    mapping(address => bool) public authorizedUsers;

    uint256 public departmentCount;
    uint256 public projectCount;

    event DepartmentAdded(uint256 departmentId, string name);
    event ProjectAdded(uint256 projectId, string name, uint256 departmentId);
    event FundsAllocated(uint256 projectId, uint256 amount);
    event FundsUtilized(uint256 projectId, uint256 amount);

    modifier onlyAuthorized() {
        require(authorizedUsers[msg.sender], "Not authorized");
        _;
    }

    constructor() {
        authorizedUsers[msg.sender] = true; // Contract deployer is authorized
    }

    function addAuthorizedUser(address user) public onlyAuthorized {
        authorizedUsers[user] = true;
    }

    function addDepartment(string memory name) public onlyAuthorized {
        departmentCount++;
        departments[departmentCount] = Department(name, new uint256[](0));
        emit DepartmentAdded(departmentCount, name);
    }

    function addProject(uint256 departmentId, string memory name) public onlyAuthorized {
        require(departmentId > 0 && departmentId <= departmentCount, "Invalid department ID");
        projectCount++;
        projects[projectCount] = Project(name, 0, 0);
        departments[departmentId].projectIds.push(projectCount);
        emit ProjectAdded(projectCount, name, departmentId);
    }

    function allocateFunds(uint256 projectId, uint256 amount) public onlyAuthorized {
        require(projectId > 0 && projectId <= projectCount, "Invalid project ID");
        projects[projectId].allocatedFunds += amount;
        emit FundsAllocated(projectId, amount);
    }

    function utilizeFunds(uint256 projectId, uint256 amount) public onlyAuthorized {
        require(projectId > 0 && projectId <= projectCount, "Invalid project ID");
        require(projects[projectId].allocatedFunds >= projects[projectId].utilizedFunds + amount, "Insufficient allocated funds");
        projects[projectId].utilizedFunds += amount;
        emit FundsUtilized(projectId, amount);
    }

    function getProjectDetails(uint256 projectId) public view returns (string memory name, uint256 allocatedFunds, uint256 utilizedFunds) {
        require(projectId > 0 && projectId <= projectCount, "Invalid project ID");
        Project memory project = projects[projectId];
        return (project.name, project.allocatedFunds, project.utilizedFunds);
    }

    function getDepartmentProjects(uint256 departmentId) public view returns (uint256[] memory) {
        require(departmentId > 0 && departmentId <= departmentCount, "Invalid department ID");
        return departments[departmentId].projectIds;
    }
}