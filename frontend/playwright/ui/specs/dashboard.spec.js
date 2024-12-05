import { test, expect } from "@playwright/test";
import DashboardPage from "../pages/DashboardPage";

test.beforeEach(async ({ page }) => {
  await DashboardPage.init(page);
  await DashboardPage.mockRPC(
    page,
    "get-profile",
    "logged-in-user/get-profile-logged-in-no-onboarding.json",
  );
});

test("Dashboad page has title ", async ({ page }) => {
  const dashboardPage = new DashboardPage(page);

  await dashboardPage.goToDashboard();

  await expect(dashboardPage.page).toHaveURL(/dashboard/);
  await expect(dashboardPage.mainHeading).toBeVisible();
});

test("User can create a new project", async ({ page }) => {
  const dashboardPage = new DashboardPage(page);
  await dashboardPage.setupNewProject();

  await dashboardPage.goToDashboard();
  await dashboardPage.addProjectButton.click();

  await expect(dashboardPage.projectName).toBeVisible();
});

test("User goes to draft page", async ({ page }) => {
  const dashboardPage = new DashboardPage(page);
  await dashboardPage.setupDraftsEmpty();

  await dashboardPage.goToDashboard();
  await dashboardPage.draftsLink.click();

  await expect(dashboardPage.mainHeading).toHaveText("Drafts");
});

test("Lists files in the drafts page", async ({ page }) => {
  const dashboardPage = new DashboardPage(page);
  await dashboardPage.setupDrafts();

  await dashboardPage.goToDrafts();

  await expect(
    dashboardPage.page.getByRole("button", { name: /New File 1/ }),
  ).toBeVisible();
  await expect(
    dashboardPage.page.getByRole("button", { name: /New File 2/ }),
  ).toBeVisible();
});

test("Bug 9443, Admin can not demote owner", async ({ page }) => {
  const dashboardPage = new DashboardPage(page);
  await dashboardPage.setupDashboardFull();
  await DashboardPage.mockRPC(
    page,
    "get-team-members?team-id=*",
    "dashboard/get-team-members-admin.json",
  );

  await dashboardPage.goToSecondTeamMembersSection();

  await expect(page.getByRole("heading", { name: "Members" })).toBeVisible();
  await expect(page.getByRole("combobox", { name: "Admin" })).toBeVisible();
  await expect(page.getByText("Owner")).toBeVisible();
  await expect(page.getByRole("combobox", { name: "Owner" })).toHaveCount(0);
});
