import org.jetbrains.kotlin.gradle.dsl.JvmTarget

plugins {
    kotlin("jvm") version "2.2.20"
    kotlin("plugin.spring") version "2.2.20"
    kotlin("plugin.serialization") version "2.2.20"
    id("org.springframework.boot") version "4.0.6"
    id("io.spring.dependency-management") version "1.1.7"
}

group = "com.dunamismax"
version = "0.1.0"

java {
    toolchain { languageVersion = JavaLanguageVersion.of(21) }
}

repositories { mavenCentral() }

dependencies {
    implementation("org.springframework.boot:spring-boot-starter-web")
    implementation("org.springframework.boot:spring-boot-starter-thymeleaf")
    implementation("org.springframework.boot:spring-boot-starter-data-jdbc")
    implementation("org.springframework.boot:spring-boot-starter-jooq")
    implementation("org.springframework.boot:spring-boot-starter-validation")
    implementation("org.springframework.boot:spring-boot-starter-actuator")

    implementation("org.jetbrains.kotlin:kotlin-reflect")
    implementation("org.jetbrains.kotlinx:kotlinx-serialization-json:1.9.0")

    implementation("org.flywaydb:flyway-core")
    implementation("org.flywaydb:flyway-database-postgresql")
    runtimeOnly("org.postgresql:postgresql")

    implementation("org.commonmark:commonmark:0.26.0")
    implementation("org.commonmark:commonmark-ext-gfm-tables:0.26.0")
    implementation("org.commonmark:commonmark-ext-autolink:0.26.0")
    implementation("org.tomlj:tomlj:1.1.1")

    testImplementation("org.springframework.boot:spring-boot-starter-test") {
        exclude(group = "org.mockito")
    }
    testImplementation("org.springframework.boot:spring-boot-webmvc-test")
    testImplementation("org.springframework.boot:spring-boot-testcontainers")
    testImplementation("org.testcontainers:postgresql:1.21.4")
    testImplementation("org.testcontainers:junit-jupiter:1.21.4")
}

kotlin {
    compilerOptions {
        jvmTarget = JvmTarget.JVM_21
        freeCompilerArgs.addAll("-Xjsr305=strict")
    }
}

tasks.test {
    useJUnitPlatform()
}

// Surface the content/ tree as classpath resources under content/.
tasks.named<Copy>("processResources") {
    from(rootDir.resolve("content")) { into("content") }
}

tasks.named<Copy>("processTestResources") {
    from(rootDir.resolve("content")) { into("content") }
}

// Hook the Tailwind CSS build into the resources phase so the fat jar
// always ships a fresh stylesheet. Requires `npm ci` to have run first.
val tailwindBuild by tasks.registering(Exec::class) {
    group = "build"
    description = "Compile Tailwind CSS into src/main/resources/static/css/site.css"
    workingDir = rootDir
    inputs.files(fileTree("src/main/tailwind"))
    inputs.files(fileTree("src/main/resources/templates"))
    inputs.file("tailwind.config.js")
    inputs.file("package.json")
    outputs.file("src/main/resources/static/css/site.css")
    val isWindows = org.gradle.internal.os.OperatingSystem.current().isWindows
    commandLine = if (isWindows) listOf("cmd", "/c", "npm", "run", "build:css") else listOf("npm", "run", "build:css")
}

tasks.named("processResources") { dependsOn(tailwindBuild) }

springBoot {
    buildInfo()
}
